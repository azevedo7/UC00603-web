import 'server-only';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { accounts, hashPassword, publicUser, updateAccounts } from './account-store';
import { AppError } from './errors';
import { query } from './db';
import type { User } from './domain';
function admin(user: User) {
  if (user.role !== 'admin') throw new AppError('Acesso reservado à administração.', 403);
}
export async function listUsers(user: User) {
  admin(user);
  return (await accounts()).map(publicUser);
}
export async function createUser(user: User, input: unknown) {
  admin(user);
  const value = z
    .object({
      name: z.string().trim().min(2).max(80),
      email: z
        .string()
        .trim()
        .email()
        .max(120)
        .transform((v) => v.toLowerCase()),
      password: z.string().min(12, 'Mínimo 12 caracteres').max(128),
      role: z.enum(['admin', 'rececao', 'veterinario', 'cliente']),
      ownerId: z.number().int().positive().nullable(),
      vetId: z.number().int().positive().nullable(),
    })
    .strict()
    .parse(input);
  if (value.role === 'cliente' && (!value.ownerId || value.vetId))
    throw new AppError('Um cliente deve estar associado a um dono e não a um veterinário.');
  if (value.role === 'veterinario' && (!value.vetId || value.ownerId))
    throw new AppError('Um veterinário deve estar associado ao seu registo profissional.');
  if (['admin', 'rececao'].includes(value.role) && (value.ownerId || value.vetId))
    throw new AppError('Este perfil não tem associações a dono ou veterinário.');
  if (
    value.ownerId &&
    !(await query('SELECT id_dono FROM dono WHERE id_dono=?', [value.ownerId])).length
  )
    throw new AppError('Cliente não encontrado.');
  if (
    value.vetId &&
    !(
      await query('SELECT id_veterinario FROM veterinario WHERE id_veterinario=? AND ativo=1', [
        value.vetId,
      ])
    ).length
  )
    throw new AppError('Veterinário ativo não encontrado.');
  const passwordHash = await hashPassword(value.password);
  await updateAccounts(async (list) => {
    if (list.some((a) => a.email === value.email))
      throw new AppError('Já existe uma conta com este email.');
    list.push({
      id: randomUUID(),
      name: value.name,
      email: value.email,
      role: value.role,
      ownerId: value.ownerId,
      vetId: value.vetId,
      active: true,
      passwordHash,
    });
    return list;
  });
}
export async function setUserActive(user: User, input: unknown) {
  admin(user);
  const value = z.object({ id: z.string().uuid(), active: z.boolean() }).strict().parse(input);
  if (value.id === user.id) throw new AppError('Não pode desativar a sua própria conta.');
  await updateAccounts(async (list) => {
    const target = list.find((a) => a.id === value.id);
    if (!target) throw new AppError('Conta não encontrada.', 404);
    target.active = value.active;
    return list;
  });
}
