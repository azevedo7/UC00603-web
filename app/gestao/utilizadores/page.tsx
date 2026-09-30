import { notFound } from 'next/navigation';
import { pageUser } from '@/lib/auth';
import { listUsers } from '@/lib/users';
import { lookups } from '@/lib/queries';
import { PageTitle } from '@/components/page-parts';
import { UsersPanel } from '@/components/users-panel';
export default async function Users() {
  const user = await pageUser('staff');
  if (user.role !== 'admin') notFound();
  const [users, options] = await Promise.all([listUsers(user), lookups(user)]);
  return (
    <>
      <PageTitle
        eyebrow="Administração"
        title="Utilizadores e acessos"
        subtitle="Cada pessoa tem um espaço e um nível de acesso próprio."
      />
      <UsersPanel users={users} current={user} donos={options.donos} vets={options.vets} />
      <section className="card mt-8 overflow-x-auto p-6">
        <h2 className="mb-5 font-semibold">O que cada perfil pode fazer</h2>
        <table className="w-full min-w-[600px] text-left text-xs leading-6">
          <thead>
            <tr className="text-muted">
              {['Perfil', 'Leitura', 'Escrita'].map((c) => (
                <th scope="col" key={c} className="py-3">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <tr>
              <td className="py-3 font-semibold">Administração</td>
              <td>Toda a clínica e salários</td>
              <td>Todos os registos e contas</td>
            </tr>
            <tr>
              <td className="py-3 font-semibold">Receção</td>
              <td>Registos operacionais, sem notas clínicas ou salários</td>
              <td>Clientes, identificação de animais e consultas operacionais</td>
            </tr>
            <tr>
              <td className="py-3 font-semibold">Veterinário</td>
              <td>Pacientes e as suas consultas, sem salários ou dados fiscais dos clientes</td>
              <td>As suas consultas e dados clínicos dos animais</td>
            </tr>
            <tr>
              <td className="py-3 font-semibold">Cliente</td>
              <td>A sua ficha, os seus animais e respetivas consultas</td>
              <td>Apenas os seus contactos e consentimento</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-5 text-xs leading-6 text-muted">
          Uma conta desativada perde o acesso imediatamente. Os utilizadores e as sessões ficam em
          ficheiros locais; os dados da clínica continuam no MySQL.
        </p>
      </section>
    </>
  );
}
