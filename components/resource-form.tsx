'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { fields, type Field } from '@/lib/fields';
import { meta, type Resource, type Row, type User } from '@/lib/domain';
type Lookups = { donos: Row[]; racas: Row[]; vets: Row[]; animals: Row[] };
type Values = Record<string, string | number | boolean | null>;
export function ResourceForm({
  resource,
  item,
  lookups,
  user,
  allowed,
}: {
  resource: Resource;
  item?: Row;
  lookups: Lookups;
  user: User;
  allowed: string[];
}) {
  const router = useRouter(),
    id = item?.[meta[resource].key];
  const defaults: Values = {
    ativo: true,
    consentimento_email: false,
    esterilizado: false,
    estado: 'Realizada',
    tipo: 'Rotina',
    valor_consulta: '0.00',
    id_veterinario: user.role === 'veterinario' ? user.vetId : null,
  };
  const initial: Values = {};
  for (const f of fields[resource].filter((f) => allowed.includes(f.key))) {
    initial[f.key] = item?.[f.key] ?? defaults[f.key] ?? null;
    if (f.type === 'checkbox') initial[f.key] = Boolean(initial[f.key]);
    if (f.type === 'datetime-local' && initial[f.key])
      initial[f.key] = String(initial[f.key]).replace(' ', 'T').slice(0, 16);
  }
  const [values, setValues] = useState<Values>(initial),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  function set(key: string, value: string | boolean) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }
  function options(field: Field): { value: string; label: string }[] {
    if (field.options)
      return field.options.map((v) => ({
        value: v,
        label: v === 'M' ? 'Macho' : v === 'F' ? 'Fêmea' : v,
      }));
    if (field.key === 'id_dono')
      return lookups.donos.map((r) => ({ value: String(r.id_dono), label: String(r.nome) }));
    if (field.key === 'id_raca')
      return lookups.racas.map((r) => ({
        value: String(r.id_raca),
        label: `${r.nome_especie} · ${r.nome_raca}`,
      }));
    if (field.key === 'id_animal')
      return lookups.animals.map((r) => ({
        value: String(r.id_animal),
        label: `${r.nome} · ${r.dono_nome}${r.data_obito ? ' (falecido)' : ''}`,
      }));
    return lookups.vets
      .filter((r) =>
        field.key === 'id_supervisor'
          ? r.id_veterinario !== id
          : r.ativo || r.id_veterinario === values.id_veterinario,
      )
      .map((r) => ({
        value: String(r.id_veterinario),
        label: `${r.nome}${r.ativo ? '' : ' (inativo)'}`,
      }));
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/${resource}${id ? `/${id}` : ''}`, {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.push(`/gestao/${resource}/${id || result.id}?guardado=1`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível guardar.');
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="card max-w-4xl p-6 md:p-8">
      <div className="mb-7 border-b border-line pb-5">
        <h2 className="font-semibold">{item ? 'Atualizar informação' : 'Dados do novo registo'}</h2>
        <p className="mt-2 text-xs leading-6 text-muted">
          Os campos com * são obrigatórios. Preencha apenas dados fictícios de formação.
        </p>
      </div>
      {resource === 'consulta' ? (
        <div className="mb-6 rounded-lg bg-mint p-4 text-xs leading-6 text-forest">
          Este ecrã regista consultas e o seu resultado. Os estados existentes são Realizada, Faltou
          e Anulada. Não existe um estado de marcação pendente no esquema.
        </div>
      ) : null}
      {error ? (
        <div role="alert" className="mb-6 rounded-lg bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      ) : null}
      <fieldset disabled={busy} className="grid gap-x-6 gap-y-5 md:grid-cols-2">
        {fields[resource]
          .filter((f) => allowed.includes(f.key))
          .map((f) => (
            <div key={f.key} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
              {f.type === 'checkbox' ? (
                <label className="flex min-h-12 items-center gap-3 rounded-lg bg-cream px-4 text-sm">
                  <input
                    className="h-4 w-4 accent-[#285c47]"
                    type="checkbox"
                    checked={Boolean(values[f.key])}
                    onChange={(e) => set(f.key, e.target.checked)}
                  />
                  {f.label}
                </label>
              ) : (
                <>
                  <Label className="mb-2 block" htmlFor={f.key}>
                    {f.label}
                    {f.required ? ' *' : ''}
                  </Label>
                  {f.type === 'select' ? (
                    <select
                      id={f.key}
                      className="field"
                      value={String(values[f.key] ?? '')}
                      required={f.required}
                      disabled={f.key === 'id_veterinario' && user.role === 'veterinario'}
                      onChange={(e) => set(f.key, e.target.value)}
                    >
                      <option value="">{f.required ? 'Selecionar…' : 'Não indicado'}</option>
                      {options(f).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <Textarea
                      id={f.key}
                      className="min-h-28"
                      maxLength={f.maxLength}
                      value={String(values[f.key] ?? '')}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                  ) : (
                    <Input
                      id={f.key}
                      type={f.type || 'text'}
                      required={f.required}
                      maxLength={f.maxLength}
                      min={f.min}
                      max={f.max}
                      step={f.type === 'number' ? '0.01' : undefined}
                      value={String(values[f.key] ?? '')}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                  )}
                </>
              )}
              {f.help ? <p className="mt-2 text-[11px] leading-5 text-muted">{f.help}</p> : null}
            </div>
          ))}
      </fieldset>
      <div className="mt-8 flex justify-end gap-3 border-t border-line pt-6">
        <Button asChild variant="outline">
          <Link href={id ? `/gestao/${resource}/${id}` : `/gestao/${resource}`}>Cancelar</Link>
        </Button>
        <Button disabled={busy} type="submit">
          <Save size={16} className="mr-2" />
          {busy ? 'A guardar…' : 'Guardar registo'}
        </Button>
      </div>
    </form>
  );
}
