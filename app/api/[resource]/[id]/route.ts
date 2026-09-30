import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { isResource } from '@/lib/domain';
import { AppError } from '@/lib/errors';
import { getResource, mutate, related, consultationExtras } from '@/lib/queries';
import { apiError, body, checkOrigin, json } from '@/lib/http';
async function target(params: Promise<{ resource: string; id: string }>) {
  const p = await params;
  if (!isResource(p.resource) || !/^\d+$/.test(p.id) || Number(p.id) < 1)
    throw new AppError('Registo não encontrado.', 404);
  return { resource: p.resource, id: Number(p.id) };
}
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> },
) {
  try {
    const user = await requireUser(),
      { resource, id } = await target(params),
      item = await getResource(user, resource, id);
    if (!item) throw new AppError('Registo não encontrado.', 404);
    return json({
      item,
      related: await related(user, resource, id),
      ...(resource === 'consulta' ? { extras: await consultationExtras(user, id) } : {}),
    });
  } catch (e) {
    return apiError(e);
  }
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> },
) {
  try {
    checkOrigin(req);
    const user = await requireUser(),
      { resource, id } = await target(params);
    await mutate(user, resource, id, await body(req));
    return json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
