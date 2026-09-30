import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { User } from './domain';
const scrypt = promisify(scryptCallback);
export type Account = User & { passwordHash: string };
export const dataDir = join(process.cwd(), '.data');
const accountFile = join(dataDir, 'accounts.json');
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password: string, hash: string) {
  const [salt, hex] = hash.split(':');
  const key = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hex, 'hex');
  return key.length === expected.length && timingSafeEqual(key, expected);
}
export async function accounts(): Promise<Account[]> {
  try {
    return JSON.parse(await readFile(accountFile, 'utf8'));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw e;
  }
}
export function publicUser(account: Account): User {
  const { id, name, email, role, ownerId, vetId, active } = account;
  return { id, name, email, role, ownerId, vetId, active };
}
export async function saveAccounts(list: Account[]) {
  await mkdir(dataDir, { recursive: true, mode: 0o700 });
  const temp = `${accountFile}.${randomBytes(6).toString('hex')}.tmp`;
  await writeFile(temp, JSON.stringify(list, null, 2), { mode: 0o600 });
  await rename(temp, accountFile);
}
let writes = Promise.resolve();
export function updateAccounts(update: (list: Account[]) => Promise<Account[]>) {
  const result = writes.then(async () => saveAccounts(await update(await accounts())));
  writes = result.catch(() => {});
  return result;
}
