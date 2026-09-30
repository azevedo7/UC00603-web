export function validOrigin(
  origin: string | null,
  host: string | null,
  protocol: string,
  appUrl?: string,
): boolean {
  try {
    const parsed = new URL(origin || '');
    if (parsed.origin !== origin || parsed.host !== host) return false;
    if (appUrl) {
      const canonical = new URL(appUrl);
      return ['http:', 'https:'].includes(canonical.protocol) && parsed.origin === canonical.origin;
    }
    // Next pode normalizar loopback em nextUrl; o Host conserva o endereço recebido.
    return (
      ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname) && parsed.protocol === protocol
    );
  } catch {
    return false;
  }
}
