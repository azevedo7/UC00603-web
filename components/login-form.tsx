'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Headset,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
const demoProfiles = [
  { label: 'Administração', email: 'admin@clinicavet.test', icon: ShieldCheck },
  { label: 'Receção', email: 'rececao@clinicavet.test', icon: Headset },
  { label: 'Veterinário', email: 'vet@clinicavet.test', icon: Stethoscope },
  { label: 'Cliente 1', email: 'cliente@clinicavet.test', icon: UserRound },
  { label: 'Cliente 2', email: 'cliente2@clinicavet.test', icon: UserRound },
];
export function LoginForm() {
  const router = useRouter(),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [show, setShow] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await authenticate(String(f.get('email')), String(f.get('password')));
  }
  async function authenticate(email: string, password: string) {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
    <div className="space-y-7" aria-busy={busy}>
      {error ? (
        <div role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}
      <section aria-labelledby="demo-profiles">
        <h3 id="demo-profiles" className="mb-3 text-sm font-semibold">
          Experimentar um perfil
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {demoProfiles.map(({ label, email, icon: Icon }, index) => (
            <Button
              key={email}
              type="button"
              variant="outline"
              className={`h-12 gap-2 text-forest ${index === 0 ? 'col-span-2 bg-mint' : ''}`}
              aria-label={`Entrar como ${label}`}
              disabled={busy}
              onClick={() => authenticate(email, 'Formacao2026!')}
            >
              <Icon size={17} /> {label}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-muted">
          Entre com um clique. Contas partilhadas, apenas com dados fictícios.
        </p>
      </section>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        <span>Ou use os seus dados de acesso</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <form onSubmit={submit} className="space-y-5">
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
      </form>
    </div>
  );
}
