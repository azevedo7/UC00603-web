import { notFound } from 'next/navigation';
import { pageUser } from '@/lib/auth';
import { listResource, type Filters } from '@/lib/queries';
import { ResourceList } from '@/components/resource-list';
import { PageTitle, Empty } from '@/components/page-parts';
import { PetCard } from '@/components/pet-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
export default async function List({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<Filters>;
}) {
  const { resource } = await params;
  if (resource !== 'animal' && resource !== 'consulta') notFound();
  const user = await pageUser('client'),
    filters = await searchParams,
    data = await listResource(user, resource, filters);
  return (
    <>
      <PageTitle
        eyebrow="O meu espaço"
        title={resource === 'animal' ? 'Os meus animais' : 'As minhas consultas'}
        subtitle={
          resource === 'animal'
            ? 'Os companheiros que fazem parte da sua família.'
            : 'O histórico de cuidados dos seus animais.'
        }
      />
      {resource === 'consulta' ? (
        <ResourceList
          resource={resource}
          data={data}
          filters={filters}
          user={user}
          prefix="/portal"
        />
      ) : (
        <>
          <form action="/portal/animal" className="mb-7 flex flex-wrap gap-3">
            <Input
              aria-label="Pesquisar os meus animais"
              name="search"
              placeholder="Procurar um companheiro…"
              defaultValue={filters.search}
              className="max-w-md bg-white"
            />
            <Button type="submit">Pesquisar</Button>
            {filters.search ? (
              <Button asChild variant="ghost">
                <Link href="/portal/animal">Limpar</Link>
              </Button>
            ) : null}
          </form>
          {data.rows.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.rows.map((a) => (
                <PetCard key={a.id_animal} animal={a} />
              ))}
            </div>
          ) : (
            <Empty text="Nenhum animal corresponde a esta pesquisa." />
          )}
          <div className="mt-7 flex items-center justify-between text-xs text-muted">
            <span>
              {data.total} animais · Página {data.page} de {data.pages}
            </span>
            <div className="flex gap-4">
              {data.page > 1 ? (
                <Link
                  href={`/portal/animal?search=${encodeURIComponent(filters.search || '')}&page=${data.page - 1}`}
                >
                  ← Anterior
                </Link>
              ) : null}
              {data.page < data.pages ? (
                <Link
                  href={`/portal/animal?search=${encodeURIComponent(filters.search || '')}&page=${data.page + 1}`}
                >
                  Seguinte →
                </Link>
              ) : null}
            </div>
          </div>
        </>
      )}
    </>
  );
}
