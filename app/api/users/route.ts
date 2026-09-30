import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { listUsers, createUser, setUserActive } from '@/lib/users';
import { apiError, body, checkOrigin, json } from '@/lib/http';
export async function GET() {
  try {
    return json(await listUsers(await requireUser()));
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    checkOrigin(req);
    await createUser(await requireUser(), await body(req));
    return json({ ok: true }, 201);
  } catch (e) {
    return apiError(e);
  }
}
export async function PATCH(req: NextRequest) {
  try {
    checkOrigin(req);
    await setUserActive(await requireUser(), await body(req));
    return json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
