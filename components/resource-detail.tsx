import Link from 'next/link';
import { Edit3, PawPrint, ArrowUpRight } from 'lucide-react';
import { fields, labels } from '@/lib/fields';
import {
  canWrite,
  displayDate,
  meta,
  money,
  type Resource,
  type Row,
  type User,
} from '@/lib/domain';
import { consultationExtras, related } from '@/lib/queries';
import { Button } from './ui/button';
import { BackLink, ConsultationList, Empty, Notice, PageTitle, StateBadge } from './page-parts';
function value(key: string, value: Row[string]) {
  if (value === null || value === '') return <span className="text-muted">Não indicado</span>;
  if (['ativo', 'esterilizado', 'consentimento_email'].includes(key)) return value ? 'Sim' : 'Não';
  if (key === 'sexo') return value === 'M' ? 'Macho' : 'Fêmea';
  if (key === 'estado') return <StateBadge state={value} />;
  if (key.startsWith('data_')) return displayDate(value, key === 'data_hora');
  if (['salario_base', 'valor_consulta'].includes(key)) return money(value);
  if (['peso_kg', 'peso_registado'].includes(key)) return `${value} kg`;
  return String(value);
}
export async function ResourceDetail({
  resource,
  item,
  user,
  prefix = '/gestao',
  saved = false,
}: {
  resource: Resource;
  item: Row;
  user: User;
  prefix?: string;
  saved?: boolean;
}) {
  const id = Number(item[meta[resource].key]),
    relation = await related(user, resource, id),
    extras = resource === 'consulta' ? await consultationExtras(user, id) : null;
  const detailFields = Object.entries(item).filter(
    ([k]) =>
      !k.startsWith('id_') &&
      ![
        'nome',
        'animal_nome',
        'dono_nome',
        'veterinario_nome',
        'total_animais',
        'total_consultas',
      ].includes(k),
  );
  const known = fields[resource].map((f) => f.key);
  const detailLabels: Record<string, string> = {
    ...labels,
    email: 'Email de contacto',
    ...Object.fromEntries(fields[resource].map((f) => [f.key, f.label])),
  };
  detailFields.sort(([a], [b]) => known.indexOf(a) - known.indexOf(b));
  const relResource = resource === 'dono' ? 'animal' : 'consulta';
  const relHref =
    resource === 'dono'
      ? `${prefix}/animal?owner=${id}`
      : resource === 'animal'
        ? `${prefix}/consulta?animal=${id}`
        : `${prefix}/consulta?vet=${id}`;
  return (
    <>
      <BackLink
        href={`${prefix}/${resource}`}
        label={
          prefix === '/portal' && resource === 'animal' ? 'Os meus animais' : meta[resource].title
        }
      />
      {saved ? <Notice>Registo guardado com sucesso.</Notice> : null}
      <PageTitle
        eyebrow={`${meta[resource].singular} · #${id}`}
        title={String(item.nome || `Consulta #${id}`)}
        subtitle={
          resource === 'consulta'
            ? String(item.motivo)
            : resource === 'animal'
              ? `${item.nome_especie || 'Espécie não identificada'} · ${item.nome_raca || 'Sem raça registada'}`
              : String(item.email || 'Ficha do registo')
        }
        action={
          prefix === '/gestao' && canWrite(user, resource) ? (
            <Button asChild variant="outline">
              <Link href={`${prefix}/${resource}/${id}/editar`}>
                <Edit3 size={15} className="mr-2" />
                Editar ficha
              </Link>
            </Button>
          ) : null
        }
      />
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card p-6 md:p-8">
            <h2 className="mb-7 font-semibold">
              {resource === 'consulta' ? 'Registo da consulta' : 'Informação da ficha'}
            </h2>
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {detailFields.map(([key, v]) => (
                <div
                  key={key}
                  className={['notas', 'observacoes'].includes(key) ? 'sm:col-span-2' : ''}
                >
                  <dt className="mb-2 text-xs text-muted">
                    {detailLabels[key] || key.replaceAll('_', ' ')}
                  </dt>
                  <dd className="whitespace-pre-wrap break-words text-sm leading-6">
                    {value(key, v)}
                  </dd>
                </div>
              ))}
            </dl>
            {user.role === 'rececao' && resource === 'consulta' ? (
              <p className="mt-7 rounded-lg bg-cream p-4 text-xs leading-6 text-muted">
                As notas e os diagnósticos clínicos estão reservados à equipa veterinária e à
                administração.
              </p>
            ) : null}
          </section>
          {extras && user.role !== 'rececao' ? (
            <>
              <section className="card p-6">
                <h2 className="mb-5 font-semibold">Diagnósticos</h2>
                {extras.diagnosticos.length ? (
                  <div className="space-y-4">
                    {extras.diagnosticos.map((d, i) => (
                      <div key={i} className="border-l-2 border-[#b9d2a7] pl-4">
                        <div className="text-sm font-semibold">
                          {d.designacao}
                          {d.principal ? (
                            <span className="ml-2 text-xs font-normal text-forest">Principal</span>
                          ) : null}
                        </div>
                        {d.observacao_clinica ? (
                          <p className="mt-2 text-xs leading-6 text-muted">
                            {d.observacao_clinica}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">Sem diagnósticos registados.</p>
                )}
              </section>
              <section className="card p-6">
                <h2 className="mb-5 font-semibold">Tratamentos e valores</h2>
                {extras.tratamentos.length ? (
                  <div className="divide-y divide-line">
                    {extras.tratamentos.map((t, i) => (
                      <div key={i} className="flex flex-wrap justify-between gap-3 py-3">
                        <div>
                          <p className="text-sm font-medium">{t.designacao}</p>
                          <p className="mt-1 text-xs text-muted">
                            {t.quantidade} × {money(t.preco_unitario)} · desconto{' '}
                            {t.desconto_percentagem}%
                          </p>
                        </div>
                        <span className="text-sm font-semibold">{money(t.valor_linha)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">Sem tratamentos registados.</p>
                )}
                <div className="mt-5 flex justify-between border-t border-line pt-4 text-sm font-semibold">
                  <span>Total da consulta e tratamentos</span>
                  <span>
                    {money(
                      Number(item.valor_consulta) +
                        extras.tratamentos.reduce((sum, t) => sum + Number(t.valor_linha), 0),
                    )}
                  </span>
                </div>
              </section>
            </>
          ) : null}
          {resource !== 'consulta' ? (
            <section className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-6">
                <h2 className="font-semibold">
                  {resource === 'dono'
                    ? 'Animais deste cliente'
                    : resource === 'animal'
                      ? 'Histórico de consultas'
                      : 'Consultas deste veterinário'}{' '}
                  <span className="ml-2 text-xs font-normal text-muted">{relation.total}</span>
                </h2>
                {relation.total > relation.rows.length ? (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={relHref}>
                      Ver todos <ArrowUpRight className="ml-2" size={14} />
                    </Link>
                  </Button>
                ) : null}
              </div>
              {relResource === 'consulta' ? (
                <ConsultationList rows={relation.rows} prefix={prefix} />
              ) : relation.rows.length ? (
                <div className="grid gap-4 p-6 sm:grid-cols-2">
                  {relation.rows.map((a) => (
                    <Link
                      key={a.id_animal}
                      href={`${prefix}/animal/${a.id_animal}`}
                      className="flex items-center gap-3 rounded-xl border border-line p-4"
                    >
                      <PawPrint size={23} className="text-forest" />
                      <div>
                        <p className="text-sm font-semibold">{a.nome}</p>
                        <p className="mt-1 text-xs text-muted">
                          {a.nome_especie || 'Espécie não identificada'} ·{' '}
                          {a.nome_raca || 'Sem raça'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <Empty text="Este cliente ainda não tem animais registados." />
              )}
            </section>
          ) : null}
        </div>
        <aside className="space-y-5">
          <section className="card p-6">
            <div className="eyebrow mb-6">Ligações da ficha</div>
            {resource === 'animal' || resource === 'consulta' ? (
              <div className="space-y-5">
                {resource === 'consulta' ? (
                  <Linked
                    label="Paciente"
                    name={item.animal_nome}
                    href={`${prefix}/animal/${item.id_animal}`}
                  />
                ) : null}
                <Linked
                  label="Cliente / tutor"
                  name={item.dono_nome}
                  href={user.role === 'cliente' ? '/portal/perfil' : `/gestao/dono/${item.id_dono}`}
                />
                {resource === 'consulta' ? (
                  <Linked
                    label="Veterinário"
                    name={item.veterinario_nome}
                    href={
                      user.role === 'cliente'
                        ? undefined
                        : `/gestao/veterinario/${item.id_veterinario}`
                    }
                  />
                ) : null}
              </div>
            ) : (
              <p className="text-sm leading-6 text-muted">
                {resource === 'dono'
                  ? `${item.total_animais} animais ligados a este tutor.`
                  : `${item.total_consultas} consultas no histórico profissional.`}
              </p>
            )}
          </section>
          {extras ? (
            <section className="card p-6">
              <h2 className="mb-4 text-sm font-semibold">Pagamento</h2>
              {extras.pagamento ? (
                <>
                  <p className="text-2xl font-semibold">{money(extras.pagamento.valor_pago)}</p>
                  <p className="mt-2 text-xs leading-6 text-muted">
                    {extras.pagamento.metodo} · {displayDate(extras.pagamento.data_pagamento)}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {extras.pagamento.referencia || 'Sem referência'}
                  </p>
                  <p className="mt-4 text-[11px] leading-5 text-muted">
                    Montante registado. Pode corresponder a um pagamento parcial.
                  </p>
                </>
              ) : (
                <p className="text-sm leading-6 text-muted">
                  Sem pagamento registado para esta consulta.
                </p>
              )}
            </section>
          ) : null}
          <div className="rounded-xl bg-mint p-5">
            <PawPrint size={20} className="mb-3 text-forest" />
            <p className="text-xs leading-6 text-muted">
              Cada ficha liga informação de várias tabelas. Os registos desta demonstração são
              inteiramente fictícios.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
function Linked({ label, name, href }: { label: string; name: Row[string]; href?: string }) {
  return (
    <div>
      <div className="mb-1 text-xs text-muted">{label}</div>
      {href ? (
        <Link href={href} className="text-sm font-semibold text-forest hover:underline">
          {name} ↗
        </Link>
      ) : (
        <span className="text-sm font-semibold">{name}</span>
      )}
    </div>
  );
}
