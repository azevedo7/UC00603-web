import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { AppError, friendlyError } from './errors';
export function checkOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  // Next normaliza endereços de loopback em nextUrl; compara com o Host recebido.
  let parsed: URL;
  try {
    parsed = new URL(origin || '');
  } catch {
    throw new AppError('Origem do pedido inválida.', 403);
  }
  if (
    !['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname) ||
    parsed.host !== req.headers.get('host') ||
    parsed.protocol !== req.nextUrl.protocol
  )
    throw new AppError('Origem do pedido inválida.', 403);
  if (!req.headers.get('content-type')?.includes('application/json'))
    throw new AppError('Use JSON para esta operação.', 415);
}
export async function body(req: NextRequest) {
  if (Number(req.headers.get('content-length') || 0) > 64000)
    throw new AppError('Pedido demasiado grande.', 413);
  const raw = await req.text();
  if (raw.length > 64000) throw new AppError('Pedido demasiado grande.', 413);
  try {
    return JSON.parse(raw);
  } catch {
    throw new AppError('JSON inválido.');
  }
}
export function apiError(e: unknown) {
  return NextResponse.json(
    { error: friendlyError(e) },
    { status: e instanceof AppError ? e.status : 400, headers: { 'Cache-Control': 'no-store' } },
  );
}
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}
