'use client';
import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { fields } from '@/lib/fields';
import type { Row } from '@/lib/domain';
export function ProfileForm({ item }: { item: Row }) {
  const [message, setMessage] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    const f = new FormData(e.currentTarget);
    const values = Object.fromEntries(f);
    try {
      const r = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, consentimento_email: f.has('consentimento_email') }),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      setMessage('Os seus contactos foram atualizados.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível guardar.');
    } finally {
      setBusy(false);
    }
  }
  const editable = [
    'telefone',
    'telefone_alternativo',
    'email',
    'morada',
    'codigo_postal',
    'localidade',
  ];
  return (
    <form className="card p-6 md:p-8" onSubmit={submit}>
      <h2 className="mb-6 font-semibold">Os meus contactos</h2>
      {message ? (
        <p role="status" className="mb-5 rounded-lg bg-mint p-4 text-sm text-forest">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mb-5 rounded-lg bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
        {fields.dono
          .filter((f) => editable.includes(f.key))
          .map((f) => (
            <div key={f.key}>
              <Label htmlFor={f.key} className="mb-2 block">
                {f.label}
                {f.required ? ' *' : ''}
              </Label>
              <Input
                id={f.key}
                name={f.key}
                type={f.type || 'text'}
                defaultValue={String(item[f.key] || '')}
                maxLength={f.maxLength}
                required={f.required}
              />
              {f.help ? <p className="mt-2 text-[11px] text-muted">{f.help}</p> : null}
            </div>
          ))}
        <label className="flex items-center gap-3 rounded-lg bg-cream p-4 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="consentimento_email"
            defaultChecked={Boolean(item.consentimento_email)}
            className="accent-[#285c47]"
          />
          Autorizo comunicações não essenciais por email.
        </label>
      </fieldset>
      <Button className="mt-7" disabled={busy}>
        {busy ? 'A guardar…' : 'Guardar contactos'}
      </Button>
    </form>
  );
}
