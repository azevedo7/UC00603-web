import Link from 'next/link';
import { ArrowUpRight, Heart, PawPrint } from 'lucide-react';
import { pageUser } from '@/lib/auth';
import { dashboard, listResource } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { ConsultationList, Empty } from '@/components/page-parts';
import { PetCard } from '@/components/pet-card';
export default async function Portal() {
  const user = await pageUser('client'),
    [data, animals] = await Promise.all([dashboard(user), listResource(user, 'animal')]);
  return (
    <>
      <section className="mb-12 grid items-center gap-8 rounded-3xl bg-[#eaf0dd] p-8 md:grid-cols-[1fr_240px] md:p-12">
        <div>
          <p className="eyebrow mb-5">O seu espaço, os seus companheiros</p>
          <h1 className="serif text-4xl leading-[1.12] md:text-5xl">
            Olá, {user.name.split(' ')[0]}.<br />
            <span className="text-forest">Vamos cuidar deles?</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted">
            As fichas dos seus animais e o histórico de consultas, sempre por perto. Porque eles
            também fazem parte da família.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/portal/animal">
                Os meus animais <ArrowUpRight size={16} className="ml-3" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-[#c8d7b8] bg-transparent">
              <Link href="/portal/perfil">Os meus contactos</Link>
            </Button>
          </div>
        </div>
        <div className="pet-orbit relative mx-auto flex h-52 w-52 items-center justify-center rounded-full text-[#4b7050]">
          <PawPrint size={88} strokeWidth={1.2} />
          <span className="absolute -right-1 top-5 rounded-full bg-white p-4 text-[#9b684b]">
            <Heart size={25} strokeWidth={1.5} />
          </span>
          <span className="absolute bottom-3 -left-3 rounded-full bg-[#fcfaf5] px-4 py-2 text-xs font-semibold">
            Cuidado com carinho
          </span>
        </div>
      </section>
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="eyebrow mb-2">Os protagonistas</p>
            <h2 className="serif text-3xl">
              Os meus animais{' '}
              <span className="ml-2 align-middle font-sans text-sm text-muted">
                {data.counts.animais}
              </span>
            </h2>
          </div>
          <Link
            href="/portal/animal"
            className="flex items-center gap-2 text-xs font-semibold text-forest"
          >
            Ver todos <ArrowUpRight size={15} />
          </Link>
        </div>
        {animals.rows.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {animals.rows.slice(0, 3).map((a) => (
              <PetCard key={a.id_animal} animal={a} />
            ))}
          </div>
        ) : (
          <div className="card">
            <Empty text="Ainda não tem animais associados. A receção pode ajudar a completar o seu registo." />
          </div>
        )}
      </section>
      <section className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <div>
              <h2 className="serif text-2xl">O cuidado ao longo do tempo</h2>
              <p className="mt-2 text-xs text-muted">
                As consultas mais recentes dos seus animais.
              </p>
            </div>
            <Button asChild size="icon" variant="ghost">
              <Link href="/portal/consulta" aria-label="Ver todas as minhas consultas">
                <ArrowUpRight size={18} />
              </Link>
            </Button>
          </div>
          <ConsultationList rows={data.recent} prefix="/portal" />
        </div>
        <aside className="rounded-2xl bg-[#f0eadc] p-7">
          <Heart className="mb-7 text-[#92724e]" size={25} />
          <h2 className="serif text-2xl leading-8">
            Pequenos cuidados,
            <br />
            grandes companheiros.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Mantenha os contactos atualizados para que a nossa equipa possa falar consigo quando for
            necessário.
          </p>
          <Link
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-forest"
            href="/portal/perfil"
          >
            Atualizar o meu perfil <ArrowUpRight size={14} />
          </Link>
          <p className="mt-7 border-t border-[#ded6c3] pt-5 text-[11px] leading-6 text-muted">
            Para marcar uma consulta, contacte a receção da clínica. Este portal apresenta o
            histórico de cuidados.
          </p>
        </aside>
      </section>
    </>
  );
}
