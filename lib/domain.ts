export const resources = ['dono', 'animal', 'veterinario', 'consulta'] as const;
export type Resource = (typeof resources)[number];
export type Role = 'admin' | 'rececao' | 'veterinario' | 'cliente';
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  ownerId: number | null;
  vetId: number | null;
  active: boolean;
};
export type Row = Record<string, string | number | null>;
export const roles: Record<Role, string> = {
  admin: 'Administração',
  rececao: 'Receção',
  veterinario: 'Veterinário',
  cliente: 'Cliente',
};
export const states = ['Realizada', 'Faltou', 'Anulada'] as const;
export const types = ['Rotina', 'Urgência', 'Seguimento', 'Cirurgia', 'Vacinação'] as const;
export function isResource(value: string): value is Resource {
  return resources.includes(value as Resource);
}
export const meta: Record<
  Resource,
  { title: string; singular: string; description: string; key: string }
> = {
  dono: {
    title: 'Clientes',
    singular: 'cliente',
    description: 'Pessoas que confiam em nós e os seus companheiros.',
    key: 'id_dono',
  },
  animal: {
    title: 'Animais',
    singular: 'animal',
    description: 'Cada paciente tem uma história. Conheça-a aqui.',
    key: 'id_animal',
  },
  veterinario: {
    title: 'Veterinários',
    singular: 'veterinário',
    description: 'A equipa que cuida dos nossos pacientes.',
    key: 'id_veterinario',
  },
  consulta: {
    title: 'Consultas',
    singular: 'consulta',
    description: 'O acompanhamento clínico, num só lugar.',
    key: 'id_consulta',
  },
};
export function canRead(user: User, resource: Resource) {
  return user.role !== 'cliente' || resource !== 'veterinario';
}
export function canWrite(user: User, resource: Resource, create = false) {
  if (user.role === 'admin') return true;
  if (user.role === 'rececao') return resource !== 'veterinario';
  if (user.role === 'veterinario')
    return resource === 'consulta' || (!create && resource === 'animal');
  return false;
}
export const clinicalAnimalFields = ['peso_kg', 'esterilizado', 'data_obito', 'observacoes'];
export const clinicalConsultFields = ['tipo', 'motivo', 'estado', 'peso_registado', 'notas'];
export function visibleFields(user: User, resource: Resource, row: Row): Row {
  const output = { ...row };
  if (user.role !== 'admin') delete output.salario_base;
  if (user.role === 'rececao') {
    delete output.notas;
    if (resource === 'animal') delete output.observacoes;
  }
  if (user.role === 'veterinario' && resource === 'dono')
    for (const k of [
      'nif',
      'data_nascimento',
      'morada',
      'codigo_postal',
      'localidade',
      'telefone_alternativo',
      'consentimento_email',
      'observacoes',
    ])
      delete output[k];
  return output;
}
export function displayDate(value: string | number | null, time = false) {
  if (!value) return 'Não indicada';
  const raw = String(value);
  const [day, hour] = raw.split(/[T ]/);
  const [y, m, d] = day.split('-');
  return `${d}/${m}/${y}${time && hour ? ` às ${hour.slice(0, 5)}` : ''}`;
}
export function money(value: string | number | null) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(
    Number(value || 0),
  );
}
