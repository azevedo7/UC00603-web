import { notFound } from 'next/navigation';
import { pageUser } from '@/lib/auth';
import { getResource } from '@/lib/queries';
import { PageTitle } from '@/components/page-parts';
import { ProfileForm } from '@/components/profile-form';
export default async function Profile() {
  const user = await pageUser('client'),
    item = await getResource(user, 'dono', user.ownerId!);
  if (!item) notFound();
  return (
    <>
      <PageTitle
        eyebrow="Área pessoal"
        title="O meu perfil"
        subtitle="Bons contactos ajudam-nos a estar mais perto."
      />
      <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        <section className="card p-7">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-mint text-2xl text-forest">
            {String(item.nome).charAt(0)}
          </div>
          <h2 className="serif text-2xl">{item.nome}</h2>
          <p className="mt-3 text-xs text-muted">
            Cliente #{item.id_dono} · NIF {item.nif}
          </p>
          <p className="mt-6 border-t border-line pt-5 text-xs leading-6 text-muted">
            Para corrigir os dados de identificação ou associar um novo animal, contacte a receção.
          </p>
          <p className="mt-4 text-[11px] leading-5 text-muted">
            O email de contacto e o email de início de sessão são independentes. O acesso continua a
            ser {user.email}.
          </p>
        </section>
        <ProfileForm item={item} />
      </div>
    </>
  );
}
