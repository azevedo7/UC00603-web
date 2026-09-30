import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validOrigin } from '../lib/origin';

test('aceita a origem HTTPS configurada mesmo com transporte HTTP interno', () => {
  assert.equal(
    validOrigin(
      'https://clinicavet.jfazevedo.pt',
      'clinicavet.jfazevedo.pt',
      'http:',
      'https://clinicavet.jfazevedo.pt',
    ),
    true,
  );
});

test('rejeita outras origens, Hosts e origens ausentes ou malformadas', () => {
  const canonical = 'https://clinicavet.jfazevedo.pt';
  for (const origin of [
    null,
    'null',
    'https://outro.pt',
    'http://clinicavet.jfazevedo.pt',
    `${canonical}/login`,
    `${canonical}.outro.pt`,
  ])
    assert.equal(validOrigin(origin, 'clinicavet.jfazevedo.pt', 'http:', canonical), false);
  assert.equal(validOrigin(canonical, 'outro.pt', 'http:', canonical), false);
  assert.equal(validOrigin(canonical, 'clinicavet.jfazevedo.pt', 'http:', 'inválido'), false);
});

test('sem configuração mantém apenas origens locais com o protocolo e Host corretos', () => {
  for (const host of ['localhost:3000', '127.0.0.1:3100', '[::1]:3000'])
    assert.equal(validOrigin(`http://${host}`, host, 'http:'), true);
  assert.equal(validOrigin('http://localhost:3000', 'localhost:3100', 'http:'), false);
  assert.equal(validOrigin('https://localhost:3000', 'localhost:3000', 'http:'), false);
  assert.equal(
    validOrigin('https://clinicavet.jfazevedo.pt', 'clinicavet.jfazevedo.pt', 'https:'),
    false,
  );
});
