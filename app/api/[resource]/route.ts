import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { isResource } from '@/lib/domain';
import { AppError } from '@/lib/errors';
import { listResource, lookups, mutate } from '@/lib/queries';
import { apiError, body, checkOrigin, json } from '@/lib/http';
export async function GET(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const user = await requireUser(),
      { resource } = await params;
    if (resource === 'lookups') return json(await lookups(user));
    if (!isResource(resource)) throw new AppError('Secção desconhecida.', 404);
    return json(await listResource(user, resource, Object.fromEntries(req.nextUrl.searchParams)));
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    checkOrigin(req);
    const user = await requireUser(),
      { resource } = await params;
    if (!isResource(resource)) throw new AppError('Secção desconhecida.', 404);
    return json({ id: await mutate(user, resource, null, await body(req)) }, 201);
  } catch (e) {
    return apiError(e);
  }
}
