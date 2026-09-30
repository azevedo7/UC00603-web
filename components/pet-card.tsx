import Link from 'next/link';
import { Cat, Dog, Bird, PawPrint, ArrowUpRight } from 'lucide-react';
import { type Row } from '@/lib/domain';
export function PetCard({ animal }: { animal: Row }) {
  const Icon =
    animal.nome_especie === 'Gato'
      ? Cat
      : animal.nome_especie === 'Cão'
        ? Dog
        : animal.nome_especie === 'Ave'
          ? Bird
          : PawPrint;
  return (
    <Link href={`/portal/animal/${animal.id_animal}`} className="card group overflow-hidden">
      <div className="relative flex h-36 items-center justify-center bg-[#f0f3e5]">
        <Icon size={67} strokeWidth={1.1} className="text-[#738763]" />
        <span className="absolute right-4 top-4 rounded-full bg-white/80 px-2 py-1 text-[10px] text-muted">
          {animal.data_obito ? 'Em memória' : 'O seu companheiro'}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="serif text-2xl">{animal.nome}</h3>
          <ArrowUpRight size={17} className="text-muted group-hover:text-forest" />
        </div>
        <p className="mt-2 text-xs text-muted">
          {animal.nome_especie || 'Espécie não identificada'} ·{' '}
          {animal.nome_raca || 'Sem raça registada'}
        </p>
        <div className="mt-5 flex gap-4 border-t border-line pt-4 text-[11px] text-muted">
          <span>{animal.sexo === 'F' ? 'Fêmea' : 'Macho'}</span>
          <span>{animal.peso_kg ? `${animal.peso_kg} kg` : 'Peso não registado'}</span>
        </div>
      </div>
    </Link>
  );
}
