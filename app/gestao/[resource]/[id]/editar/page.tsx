import { notFound } from 'next/navigation';
import { pageUser } from '@/lib/auth';
import { isResource, meta, canWrite } from '@/lib/domain';
import { getResource, lookups } from '@/lib/queries';
import { allowedFields } from '@/lib/validation';
import { PageTitle, BackLink } from '@/components/page-parts';
import { ResourceForm } from '@/components/resource-form';
export default async function Edit({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource, id } = await params;
  if (!isResource(resource) || !/^\d+$/.test(id)) notFound();
  const user = await pageUser('staff');
  if (!canWrite(user, resource)) notFound();
  const item = await getResource(user, resource, Number(id));
  if (!item) notFound();
  return (
    <>
      <BackLink href={`/gestao/${resource}/${id}`} label="Ficha" />
      <PageTitle
        eyebrow={meta[resource].title}
        title={`Editar ${meta[resource].singular}`}
        subtitle={String(item.nome || item.motivo)}
      />
      <ResourceForm
        resource={resource}
        item={item}
        user={user}
        lookups={await lookups(user)}
        allowed={allowedFields(user, resource, false)}
      />
    </>
  );
}
