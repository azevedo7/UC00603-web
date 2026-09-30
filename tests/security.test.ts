import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateInput } from '../lib/validation';
import { canWrite, visibleFields, type User } from '../lib/domain';
import { hashPassword, verifyPassword } from '../lib/account-store';
const user = (role: User['role']): User => ({
  id: 'test',
  name: 'Teste',
  email: 'teste@clinicavet.test',
  role,
  ownerId: 1,
  vetId: 1,
  active: true,
});
test('a receção não pode enviar notas clínicas, mesmo num pedido direto', () => {
  assert.throws(
    () => validateInput(user('rececao'), 'consulta', false, { notas: 'Nota indevida' }),
    /Sem permissão/,
  );
});
test('um veterinário não pode transferir uma consulta para outro profissional', () => {
  assert.throws(
    () => validateInput(user('veterinario'), 'consulta', false, { id_veterinario: 2 }),
    /Sem permissão/,
  );
});
test('clientes não têm operações de escrita clínica', () => {
  for (const resource of ['dono', 'animal', 'veterinario', 'consulta'] as const)
    assert.equal(canWrite(user('cliente'), resource), false);
});
test('salários e notas não escapam nas respostas de outros perfis', () => {
  assert.equal(
    visibleFields(user('rececao'), 'consulta', { notas: 'Privado', estado: 'Realizada' }).notas,
    undefined,
  );
  for (const role of ['cliente', 'rececao', 'veterinario'] as const)
    assert.equal(
      visibleFields(user(role), 'veterinario', { salario_base: '9999.00', nome: 'Teste' })
        .salario_base,
      undefined,
    );
  assert.equal(
    visibleFields(user('veterinario'), 'dono', { nif: '123456789', nome: 'Teste' }).nif,
    undefined,
  );
});
test('não aceita estados inventados nem datas impossíveis', () => {
  assert.throws(() => validateInput(user('admin'), 'consulta', false, { estado: 'Agendada' }));
  assert.throws(() =>
    validateInput(user('admin'), 'dono', false, { data_nascimento: '2012-02-31' }),
  );
  assert.throws(() =>
    validateInput(user('admin'), 'consulta', false, { data_hora: '2026-09-29T25:61' }),
  );
});
test('NIF, contactos e valores respeitam o esquema', () => {
  assert.throws(() => validateInput(user('admin'), 'dono', false, { nif: '1 OR 1=1' }));
  assert.throws(() => validateInput(user('admin'), 'animal', false, { peso_kg: 300 }));
  assert.throws(() => validateInput(user('admin'), 'veterinario', false, { salario_base: 869.99 }));
  assert.throws(() => validateInput(user('admin'), 'consulta', false, { valor_consulta: 10.001 }));
  assert.deepEqual(validateInput(user('admin'), 'animal', false, { microchip: '', peso_kg: '' }), {
    microchip: null,
    peso_kg: null,
  });
});
test('as palavras-passe têm sal aleatório e são verificadas por hash', async () => {
  const a = await hashPassword('Formacao2026!'),
    b = await hashPassword('Formacao2026!');
  assert.notEqual(a, b);
  assert.equal(await verifyPassword('Formacao2026!', a), true);
  assert.equal(await verifyPassword('Errada', a), false);
  assert.equal(a.includes('Formacao2026!'), false);
});
