import { randomUUID } from 'node:crypto';
import mysql from 'mysql2/promise';
import { accounts, hashPassword, saveAccounts } from '../lib/account-store';
import type { Account } from '../lib/account-store';
async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'clinicavet',
  });
  try {
    const [owners] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT id_dono,nome FROM dono WHERE id_dono IN (1,3) ORDER BY id_dono',
    );
    const [vets] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT id_veterinario,nome FROM veterinario WHERE id_veterinario=1 AND ativo=1',
    );
    if (owners.length !== 2 || vets.length !== 1)
      throw new Error(
        'Os clientes de formação 1 e 3 e o veterinário ativo 1 devem existir. Nenhum dado MySQL foi alterado.',
      );
    const demo = [
      {
        email: 'admin@clinicavet.test',
        name: 'Administração de formação',
        role: 'admin',
        ownerId: null,
        vetId: null,
      },
      {
        email: 'rececao@clinicavet.test',
        name: 'Receção de formação',
        role: 'rececao',
        ownerId: null,
        vetId: null,
      },
      {
        email: 'vet@clinicavet.test',
        name: String(vets[0].nome),
        role: 'veterinario',
        ownerId: null,
        vetId: 1,
      },
      {
        email: 'cliente@clinicavet.test',
        name: String(owners[0].nome),
        role: 'cliente',
        ownerId: 1,
        vetId: null,
      },
      {
        email: 'cliente2@clinicavet.test',
        name: String(owners[1].nome),
        role: 'cliente',
        ownerId: 3,
        vetId: null,
      },
    ] as const;
    const list = await accounts();
    let created = 0;
    for (const item of demo) {
      if (list.some((a) => a.email === item.email)) continue;
      list.push({
        ...item,
        id: randomUUID(),
        active: true,
        passwordHash: await hashPassword('Formacao2026!'),
      } satisfies Account);
      created++;
    }
    await saveAccounts(list);
    console.log(
      `${created} contas criadas. Contas existentes preservadas. MySQL usado apenas em leitura.`,
    );
    console.log('Credenciais de demonstração: consulte README.md.');
  } finally {
    await connection.end();
  }
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : 'Falha de configuração');
  process.exitCode = 1;
});
