// JSON files in the user cache directory. The audit keeps its Jev answers and
// the previous run here, never in the skill folder.

import { homedir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export const CACHE_DIR = process.env.AUDIT_PRS_CACHE ?? join(process.env.XDG_CACHE_HOME ?? join(homedir(), '.cache'), 'audit-prs');

export async function readJson<T>(name: string, fallback: T): Promise<T> {
  const file = Bun.file(join(CACHE_DIR, name));
  if (!(await file.exists())) return fallback;
  try { return await file.json() as T; } catch { return fallback; }
}

export const writeJson = (name: string, value: unknown) =>
  Bun.write(join(CACHE_DIR, name), JSON.stringify(value));

export function fingerprint(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 24);
}
