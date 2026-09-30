import { NextRequest } from 'next/server';
import { z } from 'zod';
import { login } from '@/lib/auth';
import { apiError, body, checkOrigin, json } from '@/lib/http';
export async function POST(req: NextRequest) {
  try {
    checkOrigin(req);
    const input = z
      .object({ email: z.string().email().max(120), password: z.string().min(1).max(128) })
      .parse(await body(req));
    const user = await login(input.email, input.password);
    return json({ user, redirect: user.role === 'cliente' ? '/portal' : '/gestao' });
  } catch (e) {
    return apiError(e);
  }
}
