import Link from 'next/link';
import { PawPrint, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { displayDate, type Row } from '@/lib/domain';
export function PageTitle({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? <div className="eyebrow mb-3">{eyebrow}</div> : null}
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-3 text-sm leading-6 text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
export function Empty({
  text = 'Ainda não existem registos.',
  action,
}: {
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-10 text-center">
      <PawPrint className="text-[#a8bba2]" size={32} />
      <p className="max-w-sm text-sm leading-6 text-muted">{text}</p>
      {action}
    </div>
  );
}
export function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="card border-l-4 border-l-coral p-6">
      <h2 className="font-semibold">Não foi possível carregar</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{message}</p>
    </div>
  );
}
export function StateBadge({ state }: { state: Row[string] }) {
  const color =
    state === 'Anulada'
      ? 'bg-rose-50 text-rose-700 hover:bg-rose-50'
      : state === 'Faltou'
        ? 'bg-amber-50 text-amber-800 hover:bg-amber-50'
        : 'bg-[#edf4e6] text-[#456b36] hover:bg-[#edf4e6]';
  return <Badge className={`${color} border-0 font-medium`}>{state}</Badge>;
}
export function ConsultationList({
  rows,
  prefix = '/gestao',
  empty = 'Ainda não há consultas registadas.',
}: {
  rows: Row[];
  prefix?: string;
  empty?: string;
}) {
  return rows.length ? (
    <div className="divide-y divide-line">
      {rows.map((c) => (
        <Link
          key={c.id_consulta}
          href={`${prefix}/consulta/${c.id_consulta}`}
          className="clinic-row flex flex-wrap items-center justify-between gap-3 px-6 py-5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint text-forest">
              <PawPrint size={18} />
            </div>
            <div>
              <div className="font-semibold">{c.animal_nome || `Consulta #${c.id_consulta}`}</div>
              <div className="mt-1 text-xs leading-5 text-muted">
                {displayDate(c.data_hora, true)} · {c.veterinario_nome || c.dono_nome}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StateBadge state={c.estado} />
            <ArrowUpRight size={16} className="text-muted" />
          </div>
        </Link>
      ))}
    </div>
  ) : (
    <Empty text={empty} />
  );
}
export function BackLink({ href, label = 'Voltar' }: { href: string; label?: string }) {
  return (
    <Button asChild variant="ghost" className="mb-5 -ml-3 text-muted">
      <Link href={href}>← {label}</Link>
    </Button>
  );
}
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="status"
      className="mb-6 rounded-xl border border-[#d5e3c9] bg-mint px-4 py-3 text-sm text-forest"
    >
      {children}
    </div>
  );
}
