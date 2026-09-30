import { notFound } from 'next/navigation';
import { pageUser } from '@/lib/auth';
import { getResource } from '@/lib/queries';
import { ResourceDetail } from '@/components/resource-detail';
export default async function Detail({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource, id } = await params;
  if ((resource !== 'animal' && resource !== 'consulta') || !/^\d+$/.test(id)) notFound();
  const user = await pageUser('client'),
    item = await getResource(user, resource, Number(id));
  if (!item) notFound();
  return <ResourceDetail resource={resource} item={item} user={user} prefix="/portal" />;
}
