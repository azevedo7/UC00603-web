import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createHash, randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { accounts, dataDir, publicUser, verifyPassword } from './account-store';
import { AppError } from './errors';
import type { User } from './domain';
const cookieName = 'clinicavet_session';
const sessionDir = join(dataDir, 'sessions');
const lifetime = 60 * 60 * 8;
const sessionPath = (token: string) =>
  join(sessionDir, `${createHash('sha256').update(token).digest('hex')}.json`);
export const currentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  try {
    const session = JSON.parse(await readFile(sessionPath(token), 'utf8')) as {
      userId: string;
      expires: number;
    };
    if (session.expires < Date.now()) return null;
    const user = (await accounts()).find((a) => a.id === session.userId && a.active);
    return user ? publicUser(user) : null;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw e;
  }
});
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new AppError('Inicie sessão para continuar.', 401);
  return user;
}
export async function pageUser(area?: 'staff' | 'client') {
  const user = await currentUser();
  if (!user) redirect('/login');
  if (area === 'staff' && user.role === 'cliente') redirect('/portal');
  if (area === 'client' && user.role !== 'cliente') redirect('/gestao');
  return user;
}
const attempts = new Map<string, { count: number; until: number }>();
export async function login(email: string, password: string) {
  const key = email.trim().toLowerCase();
  const now = Date.now();
  for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
  const attempt = attempts.get(key);
  if (attempt && attempt.count >= 5)
    throw new AppError('Demasiadas tentativas. Aguarde 15 minutos.', 429);
  const list = await accounts();
  if (list.length === 0)
    throw new AppError('Execute npm run setup:demo para preparar as contas de formação.', 503);
  const account = list.find((a) => a.email === key && a.active);
  const valid = await verifyPassword(password, account?.passwordHash || list[0].passwordHash);
  if (!account || !valid) {
    attempts.set(key, {
      count: (attempt?.count || 0) + 1,
      until: attempt?.until || now + 15 * 60 * 1000,
    });
    throw new AppError('Email ou palavra-passe incorretos.', 401);
  }
  attempts.delete(key);
  await logout();
  const token = randomBytes(32).toString('hex');
  await mkdir(sessionDir, { recursive: true, mode: 0o700 });
  await writeFile(
    sessionPath(token),
    JSON.stringify({ userId: account.id, expires: now + lifetime * 1000 }),
    { mode: 0o600 },
  );
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    path: '/',
    maxAge: lifetime,
  });
  return publicUser(account);
}
export async function logout() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token && /^[a-f0-9]{64}$/.test(token))
    await unlink(sessionPath(token)).catch((e) => {
      if (e.code !== 'ENOENT') throw e;
    });
  jar.delete(cookieName);
}
