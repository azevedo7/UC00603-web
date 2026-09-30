import { NextRequest } from 'next/server';
import { logout } from '@/lib/auth';
import { apiError, checkOrigin, json } from '@/lib/http';
export async function POST(req: NextRequest) {
  try {
    checkOrigin(req);
    await logout();
    return json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
