'use client';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="card p-8">
      <h2 className="text-xl font-semibold">Não foi possível carregar os registos.</h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        Confirme que o MySQL está iniciado e que as credenciais do ficheiro .env.local estão
        corretas.
      </p>
      <Button onClick={reset} className="mt-5">
        Tentar novamente
      </Button>
    </div>
  );
}
