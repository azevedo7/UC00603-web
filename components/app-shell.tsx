'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  PawPrint,
  LayoutDashboard,
  Users,
  Cat,
  Stethoscope,
  CalendarDays,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { roles, type User } from '@/lib/domain';
const nav = [
  ['/gestao', 'Visão geral', LayoutDashboard],
  ['/gestao/dono', 'Clientes', Users],
  ['/gestao/animal', 'Animais', Cat],
  ['/gestao/veterinario', 'Veterinários', Stethoscope],
  ['/gestao/consulta', 'Consultas', CalendarDays],
  ['/gestao/utilizadores', 'Utilizadores e acessos', ShieldCheck],
] as const;
function Brand({ portal = false }: { portal?: boolean }) {
  return (
    <Link href={portal ? '/portal' : '/gestao'} className="flex items-center gap-3">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${portal ? 'bg-forest text-white' : 'bg-[#c7e0b5] text-[#173e32]'}`}
      >
        <PawPrint size={22} />
      </span>
      <span>
        <span className="block text-xl font-semibold tracking-tight">
          Clínica<span className={portal ? 'text-forest' : 'text-[#c7e0b5]'}>Vet</span>
        </span>
        <span className="block text-[10px] uppercase tracking-[.19em] opacity-60">Areeiro</span>
      </span>
    </Link>
  );
}
function Logout() {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function leave() {
    setBusy(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (!response.ok) throw new Error();
      router.push('/login');
      router.refresh();
    } catch {
      setError('Não foi possível terminar a sessão.');
      setBusy(false);
    }
  }
  return (
    <div>
      <Button variant="ghost" className="text-current" onClick={leave} disabled={busy}>
        <LogOut size={16} className="mr-2" />
        {busy ? 'A sair…' : 'Sair'}
      </Button>
      {error ? (
        <p role="alert" className="text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
export function AppShell({ children, user }: { children: React.ReactNode; user: User }) {
  const path = usePathname(),
    [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <aside
        className={`sidebar fixed inset-y-0 left-0 z-30 flex w-60 flex-col px-5 py-7 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between">
          <Brand />
          <button aria-label="Fechar menu" className="lg:hidden" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="mt-12 mb-4 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#839f8d]">
          Espaço de trabalho
        </div>
        <nav className="space-y-2" aria-label="Gestão clínica">
          {nav
            .filter(([href]) => href !== '/gestao/utilizadores' || user.role === 'admin')
            .map(([href, label, Icon]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={
                  path === href || (href !== '/gestao' && path.startsWith(href + '/'))
                    ? 'page'
                    : undefined
                }
                className={`navlink ${path === href || (href !== '/gestao' && path.startsWith(href + '/')) ? 'active' : ''}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
        </nav>
        <div className="mt-auto pt-10">
          <div className="rounded-xl border border-[#3b6049] bg-[#204735] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#c7e0b5]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c7e0b5]" />
              Ambiente de formação
            </div>
            <p className="text-xs leading-5 text-[#a7bfad]">
              Um projeto da UC00603.
              <br />
              Pessoas e animais fictícios.
            </p>
          </div>
          <div className="mt-5 flex items-center justify-between text-xs text-[#a7bfad]">
            <span>ClínicaVet · 2026</span>
            <PawPrint size={14} />
          </div>
        </div>
      </aside>
      {open ? (
        <button
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          aria-label="Fechar navegação"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <div className="lg:ml-60">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-5 py-3 md:px-9">
          <div className="flex items-center gap-3">
            <button aria-label="Abrir menu" className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu size={21} />
            </button>
            <div className="text-sm text-muted">
              Clínica Veterinária do Areeiro{' '}
              <span className="ml-3 hidden rounded-full border border-line px-2 py-1 text-[10px] sm:inline">
                BACKOFFICE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-mint text-sm font-semibold text-forest sm:flex">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="max-w-52 truncate text-xs font-semibold">{user.name}</div>
              <div className="mt-1 text-[11px] text-muted">{roles[user.role]}</div>
            </div>
            <Logout />
          </div>
        </header>
        <main id="main-content" className="mx-auto max-w-[1450px] px-5 py-8 md:px-9 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
export function PortalShell({ children, user }: { children: React.ReactNode; user: User }) {
  const path = usePathname();
  return (
    <div className="min-h-screen bg-[#fcfaf5]">
      <header className="border-b border-[#e7e8dd] bg-[#fcfaf5]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-6">
          <Brand portal />
          <nav
            aria-label="Área do cliente"
            className="order-3 flex w-full gap-5 overflow-x-auto md:order-none md:w-auto"
          >
            {[
              ['/portal', 'O meu espaço'],
              ['/portal/animal', 'Os meus animais'],
              ['/portal/consulta', 'Consultas'],
              ['/portal/perfil', 'O meu perfil'],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap border-b-2 pb-2 text-sm ${path === href || (href !== '/portal' && path.startsWith(href + '/')) ? 'border-forest font-semibold text-forest' : 'border-transparent text-muted'}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:block">
              Olá, {user.name.split(' ')[0]}
            </span>
            <Logout />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10 md:py-14">{children}</main>
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-line px-6 py-7 text-xs text-muted">
        <span>ClínicaVet · Cuidamos de quem faz parte da família.</span>
        <span className="flex items-center gap-2">
          Portal de demonstração · dados fictícios <ArrowUpRight size={13} />
        </span>
      </footer>
    </div>
  );
}
