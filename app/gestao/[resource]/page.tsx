import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Plus } from 'lucide-react';
import { pageUser } from '@/lib/auth';
import { isResource, meta, canWrite } from '@/lib/domain';
import { listResource, lookups, type Filters } from '@/lib/queries';
import { PageTitle } from '@/components/page-parts';
import { ResourceList } from '@/components/resource-list';
import { Button } from '@/components/ui/button';
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<Filters>;
}) {
  const { resource } = await params;
  if (!isResource(resource)) notFound();
  const user = await pageUser('staff'),
    filters = await searchParams;
  const [data, options] = await Promise.all([
    listResource(user, resource, filters),
    resource === 'consulta' && user.role !== 'veterinario' ? lookups(user) : Promise.resolve(null),
  ]);
  return (
    <>
      <PageTitle
        eyebrow="Gestão clínica"
        title={meta[resource].title}
        subtitle={meta[resource].description}
        action={
          canWrite(user, resource, true) ? (
            <Button asChild>
              <Link href={`/gestao/${resource}/novo`}>
                <Plus size={16} className="mr-2" />
                Novo {meta[resource].singular}
              </Link>
            </Button>
          ) : null
        }
      />
      <ResourceList
        resource={resource}
        data={data}
        filters={filters}
        user={user}
        vets={options?.vets}
      />
    </>
  );
}
