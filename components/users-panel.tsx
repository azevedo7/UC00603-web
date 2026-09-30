'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { roles, type Role, type Row, type User } from '@/lib/domain';
export function UsersPanel({
  users,
  current,
  donos,
  vets,
}: {
  users: User[];
  current: User;
  donos: Row[];
  vets: Row[];
}) {
  const router = useRouter(),
    [role, setRole] = useState<Role>('cliente'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [show, setShow] = useState(false);
  async function request(method: string, payload: unknown) {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setShow(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operação indisponível.');
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await request('POST', {
      name: f.get('name'),
      email: f.get('email'),
      password: f.get('password'),
      role,
      ownerId: role === 'cliente' ? Number(f.get('ownerId')) : null,
      vetId: role === 'veterinario' ? Number(f.get('vetId')) : null,
    });
  }
  return (
    <div className="space-y-5">
      {error ? (
        <div role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      ) : null}
      <div className="flex justify-end">
        <Button onClick={() => setShow(!show)} variant={show ? 'outline' : 'default'}>
          {show ? 'Fechar formulário' : 'Nova conta'}
        </Button>
      </div>
      {show ? (
        <form onSubmit={submit} className="card p-6">
          <h2 className="mb-5 font-semibold">Criar conta de formação</h2>
          <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm">
              Nome
              <Input name="name" required maxLength={80} className="mt-2" />
            </label>
            <label className="text-sm">
              Email de acesso
              <Input name="email" type="email" required maxLength={120} className="mt-2" />
            </label>
            <label className="text-sm">
              Palavra-passe
              <Input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                className="mt-2"
              />
              <span className="mt-2 block text-xs text-muted">Pelo menos 12 caracteres.</span>
            </label>
            <label className="text-sm">
              Perfil
              <select
                className="field mt-2"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                {Object.entries(roles).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {role === 'cliente' ? (
              <label className="text-sm">
                Cliente associado
                <select name="ownerId" className="field mt-2" required>
                  <option value="">Selecionar…</option>
                  {donos.map((d) => (
                    <option key={d.id_dono} value={String(d.id_dono)}>
                      #{d.id_dono} · {d.nome}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {role === 'veterinario' ? (
              <label className="text-sm">
                Veterinário associado
                <select name="vetId" className="field mt-2" required>
                  <option value="">Selecionar…</option>
                  {vets
                    .filter((v) => v.ativo)
                    .map((v) => (
                      <option key={v.id_veterinario} value={String(v.id_veterinario)}>
                        #{v.id_veterinario} · {v.nome}
                      </option>
                    ))}
                </select>
              </label>
            ) : null}
          </fieldset>
          <Button disabled={busy} className="mt-6">
            {busy ? 'A criar…' : 'Criar conta'}
          </Button>
        </form>
      ) : null}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-cream text-xs text-muted">
            <tr>
              {['Utilizador', 'Perfil', 'Associação SQL', 'Estado', 'Ação'].map((c) => (
                <th scope="col" className="px-5 py-4" key={c}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-4">
                  <p className="font-semibold">{u.name}</p>
                  <p className="mt-1 text-xs text-muted">{u.email}</p>
                </td>
                <td className="px-5 py-4">{roles[u.role]}</td>
                <td className="px-5 py-4 text-xs text-muted">
                  {u.ownerId
                    ? `dono #${u.ownerId}`
                    : u.vetId
                      ? `veterinario #${u.vetId}`
                      : 'Sem associação'}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${u.active ? 'bg-mint text-forest' : 'bg-stone-100 text-stone-500'}`}
                  >
                    {u.active ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {u.id === current.id ? (
                    <span className="text-xs text-muted">A sua conta</span>
                  ) : (
                    <Button
                      disabled={busy}
                      variant="ghost"
                      size="sm"
                      onClick={() => request('PATCH', { id: u.id, active: !u.active })}
                    >
                      {u.active ? 'Desativar' : 'Ativar'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
