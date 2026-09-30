'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
export function LoginForm() {
  const router = useRouter(),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [show, setShow] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: f.get('email'), password: f.get('password') }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      router.push(data.redirect);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível iniciar sessão.');
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      {error ? (
        <div role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="o.seu.email@clinicavet.test"
          maxLength={120}
          required
          className="h-12"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Palavra-passe</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            maxLength={128}
            required
            className="h-12 pr-12"
          />
          <button
            type="button"
            aria-label={show ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
            onClick={() => setShow(!show)}
            className="absolute right-3 top-3.5 text-muted"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <Button className="h-12 w-full justify-between px-4" disabled={busy}>
        {busy ? 'A iniciar sessão…' : 'Entrar no meu espaço'}
        <ArrowRight size={18} />
      </Button>
      <p className="text-xs leading-5 text-muted">
        As contas de demonstração estão no README do projeto. O seu perfil determina os ecrãs e os
        dados a que tem acesso.
      </p>
    </form>
  );
}
