import { PawPrint, Heart, ShieldCheck, Leaf } from 'lucide-react';
import { currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
export default async function Login() {
  const user = await currentUser();
  if (user) redirect(user.role === 'cliente' ? '/portal' : '/gestao');
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative flex flex-col overflow-hidden bg-[#183e30] p-8 text-[#f2f4df] md:p-14">
        <div className="flex items-center gap-3">
          <PawPrint size={30} className="text-[#c7e0b5]" />
          <span className="text-2xl font-semibold">
            ClínicaVet
            <span className="mt-1 block text-[10px] font-normal uppercase tracking-[.2em] opacity-60">
              Clínica Veterinária do Areeiro
            </span>
          </span>
        </div>
        <div className="my-auto py-16">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#5a7652] px-3 py-2 text-xs text-[#c7e0b5]">
            <Heart size={13} />
            Cuidado em cada ligação
          </div>
          <h1 className="serif max-w-lg text-5xl leading-[1.12] md:text-6xl">
            Uma família.
            <br />
            Muitas patinhas.
            <br />
            <span className="text-[#c7e0b5]">O mesmo cuidado.</span>
          </h1>
          <p className="mt-7 max-w-sm text-sm leading-7 text-[#b6cbb5]">
            Da receção à consulta, tudo começa com uma ligação. Um espaço para a equipa e para quem
            nos confia os seus animais.
          </p>
          <div className="mt-10 flex gap-3">
            <div className="flex h-16 w-16 rotate-[-12deg] items-center justify-center rounded-2xl bg-[#c7e0b5] text-forest">
              <PawPrint size={34} />
            </div>
            <div className="flex h-16 w-16 rotate-[8deg] items-center justify-center rounded-2xl border border-[#5a7652] text-[#c7e0b5]">
              <Leaf size={30} />
            </div>
            <div className="flex h-16 w-16 rotate-[-5deg] items-center justify-center rounded-2xl bg-[#2c5440] text-[#c7e0b5]">
              <Heart size={30} />
            </div>
          </div>
        </div>
        <p className="text-xs text-[#97b397]">
          UC00603 · Aplicação de formação · Dados inteiramente fictícios
        </p>
        <div className="pointer-events-none absolute -right-36 -bottom-40 h-96 w-96 rounded-full border border-[#35583e]" />
      </section>
      <section className="flex items-center justify-center bg-[#fcfaf5] px-7 py-14">
        <div className="w-full max-w-sm">
          <div className="eyebrow mb-4">Bem-vindo à ClínicaVet</div>
          <h2 className="text-3xl font-semibold tracking-tight">É bom ter-lhe por cá.</h2>
          <p className="mb-8 mt-3 text-sm leading-6 text-muted">
            Inicie sessão para acompanhar os seus animais ou entrar no espaço de trabalho.
          </p>
          <LoginForm />
          <div className="mt-10 flex items-center gap-2 border-t border-line pt-6 text-xs text-muted">
            <ShieldCheck size={16} className="text-forest" />
            Acesso protegido, com permissões por perfil.
          </div>
        </div>
      </section>
    </main>
  );
}
