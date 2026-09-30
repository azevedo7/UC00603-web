import 'server-only';
import mysql from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2';
import type { Row } from './domain';
declare global {
  var clinicavetPool: mysql.Pool | undefined;
}
export const pool =
  global.clinicavetPool ??
  mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'clinicavet',
    waitForConnections: true,
    connectionLimit: 8,
    charset: 'utf8mb4',
    dateStrings: true,
    decimalNumbers: false,
    multipleStatements: false,
  });
if (process.env.NODE_ENV !== 'production') global.clinicavetPool = pool;
export async function query(sql: string, params: (string | number | null)[] = []): Promise<Row[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
  return rows as Row[];
}
