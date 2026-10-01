import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  Heart,
  PawPrint,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';
import { currentUser } from '@/lib/auth';
import { PetScene } from '@/components/pet-scene';
import './landing.css';
export default async function Home() {
  const user = await currentUser();
  const access = user ? (user.role === 'cliente' ? '/portal' : '/gestao') : '/login';
  return (
    <div className="landing">
      <a href="#conteudo" className="landing-skip">
        Saltar para o conteúdo
      </a>
      <header className="landing-header landing-width">
        <Link href="/" aria-label="ClínicaVet, página inicial" className="landing-brand">
          <span className="landing-brand-mark">
            <PawPrint size={23} />
          </span>
          <span>
            ClínicaVet<small>UM LUGAR PARA CUIDAR</small>
          </span>
        </Link>
        <nav aria-label="Navegação principal" className="landing-nav">
          <a href="#cuidado">O nosso cuidado</a>
          <a href="#experiencia">O seu espaço</a>
        </nav>
        <Link href={access} className="landing-header-access">
          {user ? 'O meu espaço' : 'Entrar'} <ArrowRight size={16} />
        </Link>
      </header>
      <main id="conteudo">
        <section className="landing-hero landing-width" aria-labelledby="hero-title">
          <div className="landing-hero-copy">
            <div className="landing-kicker landing-enter">
              <span /> PATINHAS PEQUENAS. LAÇOS ENORMES.
            </div>
            <h1 id="hero-title" className="landing-enter landing-enter-1">
              Fazem parte
              <br />
              da família.
              <br />
              <em>E do nosso coração.</em>
            </h1>
            <p className="landing-hero-description landing-enter landing-enter-2">
              Um espaço para cuidar de quem nos dá tanto. Mais perto dos seus animais, da sua equipa
              e de cada pequena história.
            </p>
            <div className="landing-actions landing-enter landing-enter-3">
              <Link href={access} className="landing-primary">
                {user ? 'Voltar ao meu espaço' : 'Entrar na ClínicaVet'} <ArrowRight size={18} />
              </Link>
              <a href="#cuidado" className="landing-text-link">
                Conhecer o espaço <ArrowDown size={16} />
              </a>
            </div>
            <div className="landing-hero-note landing-enter landing-enter-3">
              <span className="landing-tiny-pets">
                <PawPrint size={16} />
                <Heart size={16} />
              </span>{' '}
              Feito para animais. Pensado para pessoas.
            </div>
          </div>
          <PetScene />
        </section>
        <div className="landing-values" aria-label="Os nossos valores">
          <div className="landing-width">
            <span>
              <Heart size={17} /> Cuidado com carinho
            </span>
            <span>
              <PawPrint size={17} /> Cada animal é único
            </span>
            <span>
              <ShieldCheck size={17} /> Informação sempre por perto
            </span>
          </div>
        </div>
        <section id="cuidado" className="landing-care landing-width" aria-labelledby="care-title">
          <div className="landing-section-heading">
            <div>
              <p className="landing-kicker">DO PRIMEIRO OLÁ AO PRÓXIMO ABRAÇO</p>
              <h2 id="care-title">
                O cuidado vive
                <br />
                <em>nos pequenos detalhes.</em>
              </h2>
            </div>
            <p>
              Uma ficha, uma consulta, uma ligação.
              <br />
              Tudo junto, para acompanhar melhor
              <br className="hidden md:block" /> quem faz parte da sua vida.
            </p>
          </div>
          <div className="landing-care-grid">
            <article>
              <span className="landing-care-icon">
                <PawPrint size={26} />
              </span>
              <span className="landing-card-number">01</span>
              <h3>Uma história só deles.</h3>
              <p>
                Os seus animais, as suas fichas e o histórico de cuidados. Porque cada patinha tem
                muito para contar.
              </p>
              <Link href={access}>
                Conhecer os meus animais <ArrowRight size={16} />
              </Link>
            </article>
            <article>
              <span className="landing-care-icon">
                <Stethoscope size={26} />
              </span>
              <span className="landing-card-number">02</span>
              <h3>Cuidar, em conjunto.</h3>
              <p>
                Clientes, veterinários e receção ligados no mesmo espaço. A informação certa, para
                cada pessoa.
              </p>
              <Link href={access}>
                Entrar no espaço da equipa <ArrowRight size={16} />
              </Link>
            </article>
            <article>
              <span className="landing-care-icon">
                <Heart size={26} />
              </span>
              <span className="landing-card-number">03</span>
              <h3>Mais perto, todos os dias.</h3>
              <p>
                Consulte o histórico e mantenha os seus contactos atualizados. Os pequenos cuidados
                começam aqui.
              </p>
              <Link href={access}>
                Abrir o meu portal <ArrowRight size={16} />
              </Link>
            </article>
          </div>
        </section>
        <section
          id="experiencia"
          className="landing-experience landing-width"
          aria-labelledby="experience-title"
        >
          <div className="landing-experience-content">
            <p className="landing-kicker">A MESMA CLÍNICA. DIFERENTES OLHARES.</p>
            <h2 id="experience-title">
              Entre.
              <br />
              <em>Sinta-se em casa.</em>
            </h2>
            <p>
              Um portal acolhedor para os tutores. Um espaço de trabalho para a equipa. Experimente
              os diferentes perfis e descubra como tudo se liga.
            </p>
            <Link href={access} className="landing-primary landing-primary-light">
              {user ? 'Abrir o meu espaço' : 'Experimentar a demonstração'} <ArrowRight size={18} />
            </Link>
            <small>Demonstração aberta a todos. Dados inteiramente fictícios.</small>
          </div>
          <div className="landing-profile-board">
            <div className="landing-profile-board-header">
              <PawPrint size={22} />
              <span>Cada pessoa, o seu espaço.</span>
              <span className="landing-live-dot" />
            </div>
            <div className="landing-profile-row">
              <span>
                <Heart size={21} />
              </span>
              <div>
                <strong>Para quem cuida em casa</strong>
                <p>Os meus animais. As suas histórias.</p>
              </div>
              <ArrowRight size={17} />
            </div>
            <div className="landing-profile-row">
              <span>
                <Stethoscope size={21} />
              </span>
              <div>
                <strong>Para quem cuida na clínica</strong>
                <p>Pacientes, consultas e notas clínicas.</p>
              </div>
              <ArrowRight size={17} />
            </div>
            <div className="landing-profile-row">
              <span>
                <Users size={21} />
              </span>
              <div>
                <strong>Para quem liga tudo</strong>
                <p>Receção, gestão e organização.</p>
              </div>
              <ArrowRight size={17} />
            </div>
            <div className="landing-profile-board-footer">
              <ShieldCheck size={15} /> Acesso e permissões por perfil
            </div>
          </div>
        </section>
      </main>
      <footer className="landing-footer landing-width">
        <Link href="/" className="landing-brand">
          <PawPrint size={23} />
          <span>ClínicaVet</span>
        </Link>
        <p>Pequenas patas. Grandes histórias.</p>
        <span>Projeto de formação · UC00603</span>
      </footer>
    </div>
  );
}
