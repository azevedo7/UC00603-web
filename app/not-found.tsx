import Link from 'next/link';
import { PawPrint } from 'lucide-react';
export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-6 py-24 text-center">
      <PawPrint size={42} className="mx-auto mb-7 text-forest" />
      <h1 className="text-3xl font-semibold">Não encontrámos esta página.</h1>
      <p className="mt-4 text-sm leading-6 text-muted">
        O registo pode não existir ou estar fora do seu perfil de acesso.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-forest px-5 py-3 text-sm text-white"
      >
        Voltar ao meu espaço
      </Link>
    </main>
  );
}
