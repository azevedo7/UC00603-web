import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { updateOwnProfile } from '@/lib/queries';
import { apiError, body, checkOrigin, json } from '@/lib/http';
export async function GET() {
  try {
    return json(await requireUser());
  } catch (e) {
    return apiError(e);
  }
}
export async function PATCH(req: NextRequest) {
  try {
    checkOrigin(req);
    await updateOwnProfile(await requireUser(), await body(req));
    return json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
