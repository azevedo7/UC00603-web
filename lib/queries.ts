import 'server-only';
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool, query } from './db';
import { AppError } from './errors';
import {
  canRead,
  canWrite,
  meta,
  visibleFields,
  type Resource,
  type Row,
  type User,
} from './domain';
import { validateInput } from './validation';
export { friendlyError } from './errors';
export type { Resource } from './domain';
export type Filters = {
  search?: string;
  estado?: string;
  tipo?: string;
  from?: string;
  to?: string;
  vet?: string;
  owner?: string;
  animal?: string;
  page?: string;
};
function scope(user: User, resource: Resource) {
  if (!canRead(user, resource)) throw new AppError('Não tem acesso a esta secção.', 403);
  if (user.role === 'cliente') {
    if (!user.ownerId) throw new AppError('Conta sem cliente associado.', 403);
    return {
      sql: resource === 'dono' ? 'd.id_dono=?' : 'a.id_dono=?',
      params: [user.ownerId],
    };
  }
  if (user.role === 'veterinario' && resource === 'consulta') {
    if (!user.vetId) throw new AppError('Conta sem veterinário associado.', 403);
    return { sql: 'c.id_veterinario=?', params: [user.vetId] };
  }
  return { sql: '1=1', params: [] };
}
function base(user: User, resource: Resource) {
  const vetFields = `v.id_veterinario,v.nome,v.cedula,v.especialidade,v.id_supervisor,v.data_admissao,v.email,v.telemovel,v.ativo${user.role === 'admin' ? ',v.salario_base' : ''}`;
  if (resource === 'dono')
    return {
      select: 'd.*, (SELECT COUNT(*) FROM animal x WHERE x.id_dono=d.id_dono) total_animais',
      from: 'dono d',
      alias: 'd',
      search:
        user.role === 'veterinario'
          ? ['d.nome', 'd.email', 'd.telefone']
          : ['d.nome', 'd.nif', 'd.email'],
      order: 'd.nome,d.id_dono',
    };
  if (resource === 'animal')
    return {
      select: `a.id_animal,a.id_dono,a.id_raca,a.nome,a.sexo,a.data_nascimento,a.data_obito,a.peso_kg,a.esterilizado,a.microchip${user.role !== 'rececao' ? ',a.observacoes' : ''},d.nome dono_nome,d.telefone,d.email,r.nome_raca,e.nome_especie`,
      from: 'animal a JOIN dono d ON d.id_dono=a.id_dono LEFT JOIN raca r ON r.id_raca=a.id_raca LEFT JOIN especie e ON e.id_especie=r.id_especie',
      alias: 'a',
      search: ['a.nome', 'd.nome', 'a.microchip'],
      order: 'a.nome,a.id_animal',
    };
  if (resource === 'veterinario')
    return {
      select: `${vetFields},s.nome supervisor_nome,(SELECT COUNT(*) FROM consulta c WHERE c.id_veterinario=v.id_veterinario) total_consultas`,
      from: 'veterinario v LEFT JOIN veterinario s ON s.id_veterinario=v.id_supervisor',
      alias: 'v',
      search: ['v.nome', 'v.cedula', 'v.especialidade'],
      order: 'v.ativo DESC,v.nome,v.id_veterinario',
    };
  return {
    select: `c.id_consulta,c.id_animal,c.id_veterinario,c.data_hora,c.tipo,c.motivo,c.valor_consulta,c.estado,c.peso_registado${user.role !== 'rececao' ? ',c.notas' : ''},a.nome animal_nome,d.id_dono,d.nome dono_nome,v.nome veterinario_nome`,
    from: 'consulta c JOIN animal a ON a.id_animal=c.id_animal JOIN dono d ON d.id_dono=a.id_dono JOIN veterinario v ON v.id_veterinario=c.id_veterinario',
    alias: 'c',
    search: ['a.nome', 'd.nome', 'v.nome', 'c.motivo'],
    order: 'c.data_hora DESC,c.id_consulta DESC',
  };
}
function where(user: User, resource: Resource, filters: Filters = {}) {
  const b = base(user, resource),
    s = scope(user, resource);
  const clauses = [s.sql],
    params: (string | number | null)[] = [...s.params];
  if (filters.search) {
    clauses.push(`(${b.search.map((f) => `${f} LIKE ?`).join(' OR ')})`);
    params.push(...b.search.map(() => `%${filters.search!.slice(0, 120)}%`));
  }
  if (resource === 'consulta') {
    for (const [key, col] of [
      ['estado', 'c.estado'],
      ['tipo', 'c.tipo'],
      ['vet', 'c.id_veterinario'],
      ['animal', 'c.id_animal'],
    ] as const)
      if (filters[key]) {
        clauses.push(`${col}=?`);
        params.push(filters[key]!);
      }
    if (filters.owner) {
      clauses.push('a.id_dono=?');
      params.push(filters.owner);
    }
    if (filters.from && /^\d{4}-\d{2}-\d{2}$/.test(filters.from)) {
      clauses.push('c.data_hora>=?');
      params.push(`${filters.from} 00:00:00`);
    }
    if (filters.to && /^\d{4}-\d{2}-\d{2}$/.test(filters.to)) {
      clauses.push('c.data_hora<=?');
      params.push(`${filters.to} 23:59:59`);
    }
  }
  if (resource === 'animal' && filters.owner) {
    clauses.push('a.id_dono=?');
    params.push(filters.owner);
  }
  return { b, sql: clauses.join(' AND '), params };
}
export async function listResource(user: User, resource: Resource, filters: Filters = {}) {
  const w = where(user, resource, filters);
  const page = Math.max(1, Math.min(100000, Number(filters.page) || 1));
  const size = 12;
  const [counts, rows] = await Promise.all([
    query(`SELECT COUNT(*) total FROM ${w.b.from} WHERE ${w.sql}`, w.params),
    query(
      `SELECT ${w.b.select} FROM ${w.b.from} WHERE ${w.sql} ORDER BY ${w.b.order} LIMIT ${size} OFFSET ${(Math.floor(page) - 1) * size}`,
      w.params,
    ),
  ]);
  return {
    rows: rows.map((r) => visibleFields(user, resource, r)),
    total: Number(counts[0].total),
    page: Math.floor(page),
    pages: Math.max(1, Math.ceil(Number(counts[0].total) / size)),
  };
}
export async function getResource(user: User, resource: Resource, id: number): Promise<Row | null> {
  const w = where(user, resource);
  const rows = await query(
    `SELECT ${w.b.select} FROM ${w.b.from} WHERE ${w.sql} AND ${w.b.alias}.${meta[resource].key}=?`,
    [...w.params, id],
  );
  return rows[0] ? visibleFields(user, resource, rows[0]) : null;
}
export async function related(user: User, resource: Resource, id: number) {
  if (!(await getResource(user, resource, id))) throw new AppError('Registo não encontrado.', 404);
  if (resource === 'dono') return listResource(user, 'animal', { owner: String(id) });
  if (resource === 'animal') return listResource(user, 'consulta', { animal: String(id) });
  if (resource === 'veterinario') return listResource(user, 'consulta', { vet: String(id) });
  return { rows: [], total: 0, page: 1, pages: 1 };
}
export async function consultationExtras(user: User, id: number) {
  if (!(await getResource(user, 'consulta', id)))
    throw new AppError('Registo não encontrado.', 404);
  const [diagnosticos, tratamentos, pagamento] = await Promise.all([
    user.role === 'rececao'
      ? Promise.resolve([])
      : query(
          'SELECT d.designacao,cd.principal,cd.observacao_clinica FROM consulta_diagnostico cd JOIN diagnostico d ON d.id_diagnostico=cd.id_diagnostico WHERE cd.id_consulta=? ORDER BY cd.principal DESC,d.designacao',
          [id],
        ),
    user.role === 'rececao'
      ? Promise.resolve([])
      : query(
          'SELECT t.designacao,ct.quantidade,ct.preco_unitario,ct.desconto_percentagem,ct.valor_linha FROM consulta_tratamento ct JOIN tratamento t ON t.id_tratamento=ct.id_tratamento WHERE ct.id_consulta=?',
          [id],
        ),
    query('SELECT data_pagamento,metodo,valor_pago,referencia FROM pagamento WHERE id_consulta=?', [
      id,
    ]),
  ]);
  return { diagnosticos, tratamentos, pagamento: pagamento[0] || null };
}
export async function lookups(user: User) {
  if (user.role === 'cliente') throw new AppError('Acesso reservado à equipa.', 403);
  const [donos, racas, vets, animals] = await Promise.all([
    query('SELECT id_dono,nome FROM dono ORDER BY nome'),
    query(
      'SELECT r.id_raca,r.nome_raca,e.nome_especie FROM raca r JOIN especie e ON e.id_especie=r.id_especie ORDER BY e.nome_especie,r.nome_raca',
    ),
    query('SELECT id_veterinario,nome,ativo FROM veterinario ORDER BY nome'),
    query(
      'SELECT a.id_animal,a.nome,a.data_obito,d.nome dono_nome FROM animal a JOIN dono d ON d.id_dono=a.id_dono ORDER BY a.nome',
    ),
  ]);
  return { donos, racas, vets, animals };
}
export async function dashboard(user: User) {
  const [donos, animais, vets, consultas, recent] = await Promise.all([
    listResource(user, 'dono'),
    listResource(user, 'animal'),
    user.role === 'cliente'
      ? Promise.resolve({ total: 0 })
      : query('SELECT COUNT(*) total FROM veterinario WHERE ativo=1').then((r) => ({
          total: Number(r[0].total),
        })),
    listResource(user, 'consulta'),
    listResource(user, 'consulta', {
      from: new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Lisbon' }),
      to: new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Lisbon' }),
    }),
  ]);
  return {
    counts: {
      donos: donos.total,
      animais: animais.total,
      veterinarios: vets.total,
      consultas: consultas.total,
      hoje: recent.total,
    },
    recent: consultas.rows.slice(0, 6),
  };
}
async function txRows(conn: PoolConnection, sql: string, params: (string | number | null)[] = []) {
  const [rows] = await conn.execute<RowDataPacket[]>(sql, params);
  return rows as Row[];
}
export async function mutate(user: User, resource: Resource, id: number | null, input: unknown) {
  if (!canWrite(user, resource, id === null))
    throw new AppError('O seu perfil não permite esta operação.', 403);
  const data = validateInput(user, resource, id === null, input);
  if (!Object.keys(data).length) throw new AppError('Não existem alterações para guardar.');
  if (user.role === 'veterinario' && resource === 'consulta' && id === null) {
    if (Number(data.id_veterinario) !== user.vetId)
      throw new AppError('Só pode criar consultas atribuídas a si.', 403);
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const current = id
      ? (
          await txRows(conn, `SELECT * FROM ${resource} WHERE ${meta[resource].key}=? FOR UPDATE`, [
            id,
          ])
        )[0]
      : null;
    if (id && !current) throw new AppError('Registo não encontrado.', 404);
    if (
      user.role === 'veterinario' &&
      resource === 'consulta' &&
      current &&
      Number(current.id_veterinario) !== user.vetId
    )
      throw new AppError('Registo não encontrado.', 404);
    const merged = { ...current, ...data };
    if (
      resource === 'animal' &&
      merged.data_nascimento &&
      merged.data_obito &&
      merged.data_obito < merged.data_nascimento
    )
      throw new AppError('A data de óbito não pode ser anterior ao nascimento.');
    if (resource === 'veterinario') {
      const vets = await txRows(
        conn,
        'SELECT id_veterinario,id_supervisor FROM veterinario FOR UPDATE',
      );
      const seen = new Set<number>(id ? [id] : []);
      let supervisor = Number(merged.id_supervisor) || null;
      while (supervisor) {
        if (seen.has(supervisor))
          throw new AppError('A hierarquia não pode conter ciclos nem supervisão de si próprio.');
        seen.add(supervisor);
        const parent = vets.find((v) => Number(v.id_veterinario) === supervisor);
        if (!parent) throw new AppError('Supervisor não encontrado.');
        supervisor = Number(parent.id_supervisor) || null;
      }
    }
    if (resource === 'consulta') {
      const changingAssignment =
        !current || Number(current.id_veterinario) !== Number(merged.id_veterinario);
      if (changingAssignment) {
        const vet = (
          await txRows(conn, 'SELECT ativo FROM veterinario WHERE id_veterinario=? FOR UPDATE', [
            Number(merged.id_veterinario),
          ])
        )[0];
        if (!vet || !vet.ativo) throw new AppError('Escolha um veterinário ativo.');
      }
    }
    const fields = Object.keys(data),
      values = Object.values(data).map((v) => (typeof v === 'boolean' ? Number(v) : v));
    if (id)
      await conn.execute(
        `UPDATE ${resource} SET ${fields.map((f) => `${f}=?`).join(',')} WHERE ${meta[resource].key}=?`,
        [...values, id],
      );
    else {
      const [result] = await conn.execute<ResultSetHeader>(
        `INSERT INTO ${resource} (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`,
        values,
      );
      id = result.insertId;
    }
    await conn.commit();
    return id;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
export async function updateOwnProfile(user: User, input: unknown) {
  if (user.role !== 'cliente' || !user.ownerId)
    throw new AppError('Acesso reservado ao cliente.', 403);
  const allowed = [
    'telefone',
    'telefone_alternativo',
    'email',
    'morada',
    'codigo_postal',
    'localidade',
    'consentimento_email',
  ];
  if (!input || typeof input !== 'object' || Object.keys(input).some((k) => !allowed.includes(k)))
    throw new AppError('Campos de perfil inválidos.');
  // Reutiliza a validação integral do cliente e grava apenas os contactos permitidos.
  const existing = await getResource(user, 'dono', user.ownerId);
  if (!existing) throw new AppError('Cliente não encontrado.', 404);
  const full = Object.fromEntries(
    [
      'nome',
      'nif',
      'data_nascimento',
      'morada',
      'codigo_postal',
      'localidade',
      'telefone',
      'telefone_alternativo',
      'email',
      'consentimento_email',
      'observacoes',
    ].map((k) => [k, k === 'consentimento_email' ? Boolean(existing[k]) : existing[k]]),
  );
  const validated = validateInput({ ...user, role: 'admin' }, 'dono', true, { ...full, ...input });
  const fields = allowed.filter((f) => f in (input as object));
  if (!fields.length) throw new AppError('Não existem alterações.');
  await pool.execute(`UPDATE dono SET ${fields.map((f) => `${f}=?`).join(',')} WHERE id_dono=?`, [
    ...fields.map((f) => (typeof validated[f] === 'boolean' ? Number(validated[f]) : validated[f])),
    user.ownerId,
  ]);
}
