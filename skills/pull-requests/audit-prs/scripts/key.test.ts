import { afterEach, expect, test } from 'bun:test';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fromKeyFile } from './key';

const dir = mkdtempSync(join(tmpdir(), 'audit-prs-key-'));
const path = join(dir, 'ai-gateway-key');
afterEach(() => rmSync(path, { force: true }));

test('reads a private key file and trims it', async () => {
  writeFileSync(path, 'secret-key\n', { mode: 0o600 });
  expect(await fromKeyFile(path)).toBe('secret-key');
});

test('ignores a key file that other users can read', async () => {
  writeFileSync(path, 'secret-key', { mode: 0o600 });
  chmodSync(path, 0o644);
  expect(await fromKeyFile(path)).toBeNull();
});

test('returns null without a key file', async () => {
  expect(await fromKeyFile(path)).toBeNull();
});
