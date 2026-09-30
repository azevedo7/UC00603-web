import Link from 'next/link';
import { ArrowLeft, ArrowRight, Search, ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Empty, StateBadge } from './page-parts';
import { displayDate, meta, states, types, type Resource, type Row, type User } from '@/lib/domain';
import type { Filters } from '@/lib/queries';
export function ResourceList({
  resource,
  data,
  filters,
  user,
  prefix = '/gestao',
  vets = [],
}: {
  resource: Resource;
  data: { rows: Row[]; total: number; page: number; pages: number };
  filters: Filters;
  user: User;
  prefix?: string;
  vets?: Row[];
}) {
  const m = meta[resource];
  const columns =
    resource === 'dono'
      ? ['Cliente', user.role === 'veterinario' ? 'Contacto' : 'NIF', 'Telefone', 'Animais']
      : resource === 'animal'
        ? ['Paciente', 'Tutor', 'Espécie / raça', 'Estado']
        : resource === 'veterinario'
          ? ['Profissional', 'Especialidade', 'Cédula', 'Estado']
          : ['Data / tipo', 'Animal / tutor', 'Veterinário', 'Estado'];
  function pageHref(page: number) {
    const sp = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v !== undefined) as [string, string][],
    );
    sp.set('page', String(page));
    return `${prefix}/${resource}?${sp}`;
  }
  return (
    <section className="card overflow-hidden">
      <form className="border-b border-line p-5" action={`${prefix}/${resource}`}>
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-48 flex-1">
            <Search size={16} className="absolute left-3 top-3 text-muted" />
            <Input
              aria-label={`Pesquisar ${m.title.toLowerCase()}`}
              name="search"
              defaultValue={filters.search}
              placeholder={`Pesquisar ${m.title.toLowerCase()}…`}
              className="h-10 pl-10"
              maxLength={120}
            />
          </div>
          <Button type="submit" variant="secondary">
            <SlidersHorizontal size={15} className="mr-2" />
            Filtrar
          </Button>
          {Object.values(filters).some(Boolean) ? (
            <Button asChild variant="ghost">
              <Link href={`${prefix}/${resource}`}>Limpar</Link>
            </Button>
          ) : null}
        </div>
        {resource === 'consulta' ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <label className="text-xs text-muted">
              Estado
              <select name="estado" defaultValue={filters.estado || ''} className="field mt-1">
                <option value="">Todos os estados</option>
                {states.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted">
              Tipo
              <select name="tipo" defaultValue={filters.tipo || ''} className="field mt-1">
                <option value="">Todos os tipos</option>
                {types.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted">
              Desde
              <input type="date" name="from" defaultValue={filters.from} className="field mt-1" />
            </label>
            <label className="text-xs text-muted">
              Até
              <input type="date" name="to" defaultValue={filters.to} className="field mt-1" />
            </label>
            {vets.length ? (
              <label className="text-xs text-muted">
                Veterinário
                <select name="vet" defaultValue={filters.vet || ''} className="field mt-1">
                  <option value="">Toda a equipa</option>
                  {vets.map((v) => (
                    <option key={v.id_veterinario} value={String(v.id_veterinario)}>
                      {v.nome}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        ) : null}
      </form>
      {data.rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#fafbf7] text-[10px] uppercase tracking-wider text-muted">
              <tr>
                {columns.map((c) => (
                  <th scope="col" className="px-6 py-4 font-semibold" key={c}>
                    {c}
                  </th>
                ))}
                <th className="px-4 py-4">
                  <span className="sr-only">Abrir ficha</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.rows.map((row) => (
                <tr className="clinic-row" key={row[m.key]}>
                  <td className="px-6 py-5">
                    <Link
                      href={`${prefix}/${resource}/${row[m.key]}`}
                      className="font-semibold text-forest hover:underline"
                    >
                      {row.nome || displayDate(row.data_hora, true)}
                    </Link>
                    <div className="mt-1 max-w-56 truncate text-xs text-muted">
                      {resource === 'consulta'
                        ? row.tipo
                        : resource === 'animal'
                          ? row.microchip || 'Sem microchip'
                          : row.email || `Registo #${row[m.key]}`}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {resource === 'dono'
                      ? row.nif || row.email || 'Não indicado'
                      : resource === 'animal'
                        ? row.dono_nome
                        : resource === 'veterinario'
                          ? row.especialidade || 'Clínica geral'
                          : row.animal_nome}
                    {resource === 'consulta' ? (
                      <div className="mt-1 max-w-52 truncate text-xs text-muted">
                        {row.dono_nome}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-5 text-muted">
                    {resource === 'dono' ? (
                      row.telefone
                    ) : resource === 'animal' ? (
                      <>
                        <span className="block text-ink">
                          {row.nome_especie || 'Não identificada'}
                        </span>
                        <span className="text-xs">{row.nome_raca || 'Sem raça registada'}</span>
                      </>
                    ) : resource === 'veterinario' ? (
                      row.cedula
                    ) : (
                      row.veterinario_nome
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {resource === 'consulta' ? (
                      <StateBadge state={row.estado} />
                    ) : resource === 'animal' ? (
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${row.data_obito ? 'bg-stone-100 text-stone-500' : 'bg-mint text-forest'}`}
                      >
                        {row.data_obito ? 'Falecido' : 'Vivo'}
                      </span>
                    ) : resource === 'veterinario' ? (
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${row.ativo ? 'bg-mint text-forest' : 'bg-stone-100 text-stone-500'}`}
                      >
                        {row.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    ) : (
                      <span>{row.total_animais} animais</span>
                    )}
                  </td>
                  <td className="px-4 py-5">
                    <Button asChild size="icon" variant="ghost">
                      <Link
                        aria-label={`Abrir ${row.nome || `consulta ${row.id_consulta}`}`}
                        href={`${prefix}/${resource}/${row[m.key]}`}
                      >
                        <ArrowUpRight size={16} />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty text="Nenhum registo corresponde a estes filtros." />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4 text-xs text-muted">
        <span>
          {data.total} {data.total === 1 ? 'registo' : 'registos'} · Página {data.page} de{' '}
          {data.pages}
        </span>
        <div className="flex gap-2">
          {data.page > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref(data.page - 1)}>
                <ArrowLeft size={14} className="mr-2" />
                Anterior
              </Link>
            </Button>
          ) : null}
          {data.page < data.pages ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref(data.page + 1)}>
                Seguinte
                <ArrowRight size={14} className="ml-2" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
