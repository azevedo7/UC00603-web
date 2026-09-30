import { notFound } from 'next/navigation';
import { pageUser } from '@/lib/auth';
import { isResource, meta, canWrite } from '@/lib/domain';
import { lookups } from '@/lib/queries';
import { allowedFields } from '@/lib/validation';
import { PageTitle, BackLink } from '@/components/page-parts';
import { ResourceForm } from '@/components/resource-form';
export default async function New({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!isResource(resource)) notFound();
  const user = await pageUser('staff');
  if (!canWrite(user, resource, true)) notFound();
  return (
    <>
      <BackLink href={`/gestao/${resource}`} label={meta[resource].title} />
      <PageTitle
        eyebrow="Novo registo"
        title={`Criar ${meta[resource].singular}`}
        subtitle="Uma nova ligação na história da clínica."
      />
      <ResourceForm
        resource={resource}
        user={user}
        lookups={await lookups(user)}
        allowed={allowedFields(user, resource, true)}
      />
    </>
  );
}
