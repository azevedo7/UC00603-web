import Link from 'next/link';
import { ArrowUpRight, Users, PawPrint, Stethoscope, CalendarDays, Plus } from 'lucide-react';
import { pageUser } from '@/lib/auth';
import { dashboard } from '@/lib/queries';
import { roles } from '@/lib/domain';
import { PageTitle, ConsultationList } from '@/components/page-parts';
import { Button } from '@/components/ui/button';
export default async function Dashboard() {
  const user = await pageUser('staff'),
    data = await dashboard(user);
  const cards = [
    { label: 'Clientes registados', value: data.counts.donos, href: '/gestao/dono', Icon: Users },
    {
      label: 'Animais acompanhados',
      value: data.counts.animais,
      href: '/gestao/animal',
      Icon: PawPrint,
    },
    {
      label: 'Veterinários ativos',
      value: data.counts.veterinarios,
      href: '/gestao/veterinario',
      Icon: Stethoscope,
    },
    {
      label: user.role === 'veterinario' ? 'As minhas consultas' : 'Consultas registadas',
      value: data.counts.consultas,
      href: '/gestao/consulta',
      Icon: CalendarDays,
    },
  ];
  return (
    <>
      <PageTitle
        eyebrow="O pulso da clínica"
        title="Visão geral"
        subtitle="Cada registo conta uma história. Aqui estão as mais recentes."
        action={
          <Button asChild>
            <Link href="/gestao/consulta/novo">
              <Plus size={16} className="mr-2" />
              Nova consulta
            </Link>
          </Button>
        }
      />
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#d8e4ca] bg-[#edf3e3] px-6 py-5">
        <div>
          <p className="text-sm font-semibold">Olá, {user.name.split(' ')[0]}. Bom trabalho!</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Está no espaço de {roles[user.role].toLowerCase()}.{' '}
            {user.role === 'veterinario'
              ? 'O histórico de consultas mostra apenas as consultas atribuídas a si.'
              : 'Os registos desta clínica são dados sintéticos de formação.'}
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-2 text-xs font-medium text-forest">
          {data.counts.hoje} consultas hoje
        </span>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, href, Icon }) => (
          <Link key={label} href={href} className="card group p-6">
            <div className="flex items-center justify-between">
              <Icon size={20} className="text-forest" />
              <ArrowUpRight size={16} className="text-[#abb5a5] group-hover:text-forest" />
            </div>
            <div className="mt-7 text-4xl font-semibold tracking-tight">{value}</div>
            <p className="mt-2 text-xs text-muted">{label}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_290px]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line p-6">
            <div>
              <h2 className="font-semibold">Consultas recentes</h2>
              <p className="mt-1 text-xs text-muted">
                {user.role === 'veterinario'
                  ? 'O seu histórico clínico.'
                  : 'Últimas consultas registadas na clínica.'}
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/gestao/consulta">
                Ver todas <ArrowUpRight size={14} className="ml-2" />
              </Link>
            </Button>
          </div>
          <ConsultationList rows={data.recent} />
        </section>
        <aside className="flex flex-col gap-5">
          <div className="rounded-xl bg-[#193f31] p-6 text-white">
            <PawPrint className="mb-8 text-[#c7e0b5]" size={32} />
            <h2 className="serif text-2xl leading-8">
              O cuidado começa
              <br />
              com bons registos.
            </h2>
            <p className="mt-4 text-xs leading-6 text-[#b8ccba]">
              Clientes, pacientes e consultas ligados pela mesma base de dados.
            </p>
            <Link
              href="/gestao/animal"
              className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#c7e0b5]"
            >
              Conhecer os pacientes <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="card p-5">
            <p className="eyebrow mb-3">Para a aula</p>
            <p className="text-xs leading-6 text-muted">
              As contagens, as fichas e o histórico que vê aqui vêm de consultas SQL ao MySQL{' '}
              <code className="text-forest">clinicavet</code>.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
