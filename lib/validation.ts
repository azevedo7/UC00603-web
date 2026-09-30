import { z } from 'zod';
import { AppError } from './errors';
import {
  clinicalAnimalFields,
  clinicalConsultFields,
  states,
  types,
  type Resource,
  type User,
} from './domain';
const required = (n: number) =>
  z.string().trim().min(1, 'Campo obrigatório').max(n, `Máximo ${n} caracteres`);
const optional = (n: number) =>
  z.preprocess((v) => (v === '' ? null : v), z.string().trim().max(n).nullable());
const id = z.coerce.number().int().positive();
const nullableId = z.preprocess((v) => (v === '' ? null : v), id.nullable());
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, 'Data inválida');
const nullableDate = z.preprocess((v) => (v === '' ? null : v), date.nullable());
const tel = z.string().regex(/^[239][0-9]{8}$/, 'Use 9 algarismos, a começar por 2, 3 ou 9');
const email = z.string().trim().email('Email inválido').max(120);
const nullableEmail = z.preprocess((v) => (v === '' ? null : v), email.nullable());
const decimal = (min: number, max: number) =>
  z.coerce
    .number()
    .min(min)
    .max(max)
    .refine(
      (v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.000001,
      'Use no máximo 2 casas decimais',
    );
const weight = z.preprocess((v) => (v === '' ? null : v), decimal(0.01, 299.99).nullable());
const schemas = {
  dono: z.object({
    nome: required(80),
    nif: z.string().regex(/^\d{9}$/, 'NIF com 9 algarismos'),
    data_nascimento: date.refine(
      (v) => v >= '1900-01-01' && v <= '2012-12-31',
      'Use uma data entre 1900 e 2012',
    ),
    morada: required(120),
    codigo_postal: z.string().regex(/^\d{4}-\d{3}$/, 'Formato 0000-000'),
    localidade: required(60),
    telefone: tel,
    telefone_alternativo: z.preprocess((v) => (v === '' ? null : v), tel.nullable()),
    email: nullableEmail,
    consentimento_email: z.boolean(),
    observacoes: optional(255),
  }),
  animal: z.object({
    id_dono: id,
    id_raca: nullableId,
    nome: required(40),
    sexo: z.enum(['M', 'F']),
    data_nascimento: nullableDate,
    data_obito: nullableDate,
    peso_kg: weight,
    esterilizado: z.boolean(),
    microchip: z.preprocess(
      (v) => (v === '' ? null : v),
      z
        .string()
        .regex(/^\d{15}$/, 'Microchip com 15 algarismos')
        .nullable(),
    ),
    observacoes: optional(255),
  }),
  veterinario: z.object({
    nome: required(80),
    cedula: required(10),
    especialidade: optional(50),
    id_supervisor: nullableId,
    data_admissao: date,
    salario_base: decimal(870, 999999.99),
    email,
    telemovel: z.preprocess(
      (v) => (v === '' ? null : v),
      z
        .string()
        .regex(/^9\d{8}$/, 'Telemóvel com 9 algarismos a começar por 9')
        .nullable(),
    ),
    ativo: z.boolean(),
  }),
  consulta: z.object({
    id_animal: id,
    id_veterinario: id,
    data_hora: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/, 'Data e hora inválidas')
      .refine(
        (v) =>
          date.safeParse(v.slice(0, 10)).success &&
          Number(v.slice(11, 13)) <= 23 &&
          Number(v.slice(14, 16)) <= 59 &&
          (v.length === 16 || Number(v.slice(17, 19)) <= 59),
        'Data e hora inválidas',
      )
      .transform((v) => v.replace('T', ' ')),
    tipo: z.enum(types),
    motivo: required(150),
    valor_consulta: decimal(0, 99999.99),
    estado: z.enum(states),
    peso_registado: weight,
    notas: optional(16000),
  }),
};
export function allowedFields(user: User, resource: Resource, create: boolean) {
  let fields = Object.keys(schemas[resource].shape);
  if (user.role === 'rececao')
    fields = fields.filter((f) => f !== 'notas' && !(resource === 'animal' && f === 'observacoes'));
  if (user.role === 'veterinario' && !create)
    fields = resource === 'animal' ? clinicalAnimalFields : clinicalConsultFields;
  if (user.role === 'veterinario' && create) fields = fields.filter((f) => f !== 'valor_consulta');
  return fields;
}
export function validateInput(user: User, resource: Resource, create: boolean, input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new AppError('Dados inválidos.');
  const allowed = allowedFields(user, resource, create);
  for (const field of Object.keys(input))
    if (!allowed.includes(field))
      throw new AppError(`Sem permissão para alterar o campo ${field}.`, 403);
  const shape = schemas[resource].shape as Record<string, z.ZodType>;
  const picked = Object.fromEntries(allowed.map((k) => [k, shape[k]]));
  const schema = z.object(picked).strict();
  return (create ? schema : schema.partial()).parse(input) as Record<
    string,
    string | number | boolean | null
  >;
}
