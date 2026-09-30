import { notFound } from 'next/navigation';
import { pageUser } from '@/lib/auth';
import { isResource } from '@/lib/domain';
import { getResource } from '@/lib/queries';
import { ResourceDetail } from '@/components/resource-detail';
export default async function Detail({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string; id: string }>;
  searchParams: Promise<{ guardado?: string }>;
}) {
  const { resource, id } = await params;
  if (!isResource(resource) || !/^\d+$/.test(id)) notFound();
  const user = await pageUser('staff'),
    item = await getResource(user, resource, Number(id));
  if (!item) notFound();
  return (
    <ResourceDetail
      resource={resource}
      item={item}
      user={user}
      saved={(await searchParams).guardado === '1'}
    />
  );
}
