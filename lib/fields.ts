import { states, types, type Resource } from './domain';
export type Field = {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
  help?: string;
  options?: readonly string[];
};
export const fields: Record<Resource, Field[]> = {
  dono: [
    { key: 'nome', label: 'Nome completo', required: true, maxLength: 80 },
    {
      key: 'nif',
      label: 'NIF',
      required: true,
      maxLength: 9,
      help: '9 algarismos. Use um NIF fictício.',
    },
    {
      key: 'data_nascimento',
      label: 'Data de nascimento',
      type: 'date',
      required: true,
      min: '1900-01-01',
      max: '2012-12-31',
      help: 'Limites definidos no esquema: 1900 a 2012.',
    },
    { key: 'email', label: 'Email', type: 'email', maxLength: 120 },
    {
      key: 'telefone',
      label: 'Telefone',
      required: true,
      maxLength: 9,
      help: '9 algarismos, a começar por 2, 3 ou 9.',
    },
    { key: 'telefone_alternativo', label: 'Telefone alternativo', maxLength: 9 },
    { key: 'morada', label: 'Morada', required: true, maxLength: 120 },
    {
      key: 'codigo_postal',
      label: 'Código postal',
      required: true,
      maxLength: 8,
      help: 'Formato 0000-000.',
    },
    { key: 'localidade', label: 'Localidade', required: true, maxLength: 60 },
    {
      key: 'consentimento_email',
      label: 'Autoriza comunicações por email',
      type: 'checkbox',
      help: 'Desativado por omissão.',
    },
    { key: 'observacoes', label: 'Observações', type: 'textarea', maxLength: 255 },
  ],
  animal: [
    { key: 'nome', label: 'Nome do animal', required: true, maxLength: 40 },
    { key: 'id_dono', label: 'Cliente / tutor', type: 'select', required: true },
    {
      key: 'id_raca',
      label: 'Espécie / raça',
      type: 'select',
      help: 'Sem raça registada significa NULL; a espécie deriva da raça.',
    },
    { key: 'sexo', label: 'Sexo', type: 'select', required: true, options: ['M', 'F'] },
    { key: 'data_nascimento', label: 'Data de nascimento', type: 'date' },
    {
      key: 'data_obito',
      label: 'Data de óbito',
      type: 'date',
      help: 'Deixe vazio para um animal vivo.',
    },
    { key: 'peso_kg', label: 'Peso (kg)', type: 'number', min: 0.01, max: 299.99 },
    {
      key: 'microchip',
      label: 'Microchip',
      maxLength: 15,
      help: '15 algarismos ou vazio se não implantado.',
    },
    { key: 'esterilizado', label: 'Animal esterilizado', type: 'checkbox' },
    { key: 'observacoes', label: 'Observações clínicas', type: 'textarea', maxLength: 255 },
  ],
  veterinario: [
    { key: 'nome', label: 'Nome completo', required: true, maxLength: 80 },
    { key: 'cedula', label: 'Cédula profissional', required: true, maxLength: 10 },
    { key: 'especialidade', label: 'Especialidade', maxLength: 50 },
    { key: 'id_supervisor', label: 'Supervisor', type: 'select' },
    { key: 'data_admissao', label: 'Data de admissão', type: 'date', required: true },
    {
      key: 'salario_base',
      label: 'Salário base (€)',
      type: 'number',
      required: true,
      min: 870,
      max: 999999.99,
      help: 'Mínimo de 870 € definido no esquema.',
    },
    { key: 'email', label: 'Email profissional', type: 'email', required: true, maxLength: 120 },
    { key: 'telemovel', label: 'Telemóvel', maxLength: 9, help: '9 algarismos, a começar por 9.' },
    { key: 'ativo', label: 'Veterinário ativo na clínica', type: 'checkbox' },
  ],
  consulta: [
    { key: 'id_animal', label: 'Animal / tutor', type: 'select', required: true },
    { key: 'id_veterinario', label: 'Veterinário', type: 'select', required: true },
    { key: 'data_hora', label: 'Data e hora', type: 'datetime-local', required: true },
    { key: 'tipo', label: 'Tipo de consulta', type: 'select', required: true, options: types },
    { key: 'motivo', label: 'Motivo da consulta', required: true, maxLength: 150 },
    { key: 'estado', label: 'Estado', type: 'select', required: true, options: states },
    {
      key: 'valor_consulta',
      label: 'Valor da consulta (€)',
      type: 'number',
      required: true,
      min: 0,
      max: 99999.99,
    },
    { key: 'peso_registado', label: 'Peso registado (kg)', type: 'number', min: 0.01, max: 299.99 },
    { key: 'notas', label: 'Notas clínicas', type: 'textarea', maxLength: 16000 },
  ],
};
export const labels: Record<string, string> = Object.fromEntries(
  Object.values(fields)
    .flat()
    .map((f) => [f.key, f.label]),
);
Object.assign(labels, {
  data_registo: 'Data de registo',
  dono_nome: 'Tutor',
  animal_nome: 'Animal',
  veterinario_nome: 'Veterinário',
  nome_raca: 'Raça',
  nome_especie: 'Espécie',
  supervisor_nome: 'Supervisor',
  total_animais: 'Animais registados',
  total_consultas: 'Consultas registadas',
});
