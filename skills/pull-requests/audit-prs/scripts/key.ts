// The AI Gateway plumbing for Jev: the key, one POST with backoff, and a
// bounded worker pool. Key order:
// `AI_GATEWAY_API_KEY`, then a private key file, then the macOS Keychain
// cache, then one `op read` of `AUDIT_PRS_OP_REF` that refills the cache. A
// loop that runs every 30 minutes asks 1Password about twice a day, not every
// run. Without `AUDIT_PRS_OP_REF`, the script does not call 1Password.

import { $ } from 'bun';

/** The 1Password secret reference with the key, such as `op://<vault>/<item>/<field>`. No default. */
const OP_REF = process.env.AUDIT_PRS_OP_REF;
const SERVICE = 'audit-prs.ai-gateway';
const ACCOUNT = 'jev';
export const KEY_TTL_HOURS = 12;
/** 1Password waits for a human to approve. In an unattended loop, give up and let the agent judge. */
const OP_TIMEOUT_MS = 45_000;
const MAX_ATTEMPTS = 5;

interface Cached { key: string; expiresAt: string }

async function fromKeychain(): Promise<string | null> {
  const out = await $`security find-generic-password -a ${ACCOUNT} -s ${SERVICE} -w`.quiet().nothrow();
  if (out.exitCode !== 0) return null;
  try {
    const cached = JSON.parse(Buffer.from(out.stdout.toString().trim(), 'base64').toString()) as Cached;
    return Date.parse(cached.expiresAt) > Date.now() ? cached.key : null;
  } catch {
    return null;
  }
}

/** Writes through `security -i` on stdin so the key never shows up in the process list. */
async function toKeychain(key: string) {
  const payload = Buffer.from(JSON.stringify({ key, expiresAt: new Date(Date.now() + KEY_TTL_HOURS * 3_600_000).toISOString() })).toString('base64');
  const proc = Bun.spawn(['security', '-i'], { stdin: 'pipe', stdout: 'ignore', stderr: 'ignore' });
  proc.stdin.write(`add-generic-password -U -a ${ACCOUNT} -s ${SERVICE} -w "${payload}"\n`);
  await proc.stdin.end();
  await proc.exited;
}

async function fromOnePassword(ref: string): Promise<string | null> {
  const proc = Bun.spawn(['op', 'read', ref], { stdout: 'pipe', stderr: 'ignore' });
  const timer = setTimeout(() => proc.kill(), OP_TIMEOUT_MS);
  const [code, text] = await Promise.all([proc.exited, new Response(proc.stdout).text()]).catch(() => [1, ''] as const);
  clearTimeout(timer);
  return code === 0 && text.trim() ? text.trim() : null;
}

/** A key file for machines without a Keychain. It must be private: mode 0600 or stricter. */
export function keyFilePath() {
  const config = process.env.XDG_CONFIG_HOME || `${process.env.HOME}/.config`;
  return process.env.AUDIT_PRS_KEY_FILE ?? `${config}/audit-prs/ai-gateway-key`;
}

export async function fromKeyFile(path = keyFilePath()): Promise<string | null> {
  const file = Bun.file(path);
  if (!(await file.exists())) return null;
  const { mode } = await file.stat();
  if (mode & 0o077) {
    console.error(`Ignoring ${path}: other users can read it. Run: chmod 600 ${path}`);
    return null;
  }
  return (await file.text()).trim() || null;
}

/** Returns the key and where it came from, or null when the model calls must be skipped. */
export async function gatewayKey(): Promise<{ key: string; source: string } | null> {
  if (process.env.AI_GATEWAY_API_KEY) return { key: process.env.AI_GATEWAY_API_KEY, source: 'env' };
  const fromFile = await fromKeyFile();
  if (fromFile) return { key: fromFile, source: 'key file' };
  const macos = process.platform === 'darwin';
  if (macos) {
    const cached = await fromKeychain();
    if (cached) return { key: cached, source: 'keychain' };
  }
  if (!OP_REF || !Bun.which('op')) return null;
  const key = await fromOnePassword(OP_REF);
  if (!key) return null;
  if (macos) await toKeychain(key);
  return { key, source: '1password' };
}

/** Drops the cached key, for example after the gateway rejects it. */
export async function forgetKey() {
  if (process.platform === 'darwin') await $`security delete-generic-password -a ${ACCOUNT} -s ${SERVICE}`.quiet().nothrow();
}

export class GatewayError extends Error {
  constructor(readonly status: number, detail: string) { super(`AI Gateway HTTP ${status}: ${detail}`); }
}

/** The gateway's own error message, for example the free tier refusing a model. */
function errorMessage(body: string) {
  try {
    const message = (JSON.parse(body) as { error?: { message?: unknown } }).error?.message;
    if (typeof message === 'string') return message.slice(0, 200);
  } catch {}
  return body.slice(0, 200);
}

/** POSTs JSON to the gateway and returns the JSON answer. Backs off on 429 while the deadline allows. */
export async function gatewayPost<T>(url: string, key: string, body: unknown, deadline: number, headers: Record<string, string> = {}): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      signal: AbortSignal.timeout(Math.max(1, deadline - Date.now())),
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    const wait = 1000 * attempt + Math.random() * 1000;
    if (res.status === 429 && attempt < MAX_ATTEMPTS && Date.now() + wait < deadline) { await Bun.sleep(wait); continue; }
    if (!res.ok) throw new GatewayError(res.status, errorMessage(await res.text()));
    return await res.json() as T;
  }
}

/**
 * Runs `call` for each item, `concurrency` at a time, until the deadline. Stops
 * at the first 401 or 403 and returns it as `denied`. Rate limits and timeouts are expected under a budget
 * and stay silent. Other failures come back in `failed`. The caller finds the
 * items that did not finish.
 */
export async function eachWithin<T>(items: T[], concurrency: number, deadline: number, call: (item: T) => Promise<void>) {
  const failed = new Map<T, string>();
  let denied: GatewayError | null = null;
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length && !denied && Date.now() < deadline) {
      const item = items[next++]!;
      try {
        await call(item);
      } catch (e) {
        if (e instanceof GatewayError && (e.status === 401 || e.status === 403)) denied ??= e;
        const expected = (e instanceof GatewayError && e.status === 429) || (e as Error).name === 'TimeoutError';
        if (!expected) failed.set(item, (e as Error).message);
      }
    }
  }));
  return { failed, denied };
}
