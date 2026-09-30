import assert from 'node:assert/strict';
const base = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';
const write = process.argv.includes('--write');
type Session = { cookie: string };
async function request(
  path: string,
  session?: Session,
  method = 'GET',
  data?: unknown,
  origin = base,
) {
  return fetch(`${base}${path}`, {
    method,
    redirect: 'manual',
    signal: AbortSignal.timeout(30000),
    headers: {
      ...(session ? { Cookie: session.cookie } : {}),
      ...(method === 'GET' ? {} : { Origin: origin, 'Content-Type': 'application/json' }),
    },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  });
}
async function login(email: string) {
  const r = await request('/api/auth/login', undefined, 'POST', {
    email,
    password: 'Formacao2026!',
  });
  assert.equal(r.status, 200, `${email}: ${await r.clone().text()}`);
  const cookie = r.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie);
  return { cookie };
}
async function json(path: string, session: Session) {
  const r = await request(path, session);
  assert.equal(r.status, 200, `${path}: ${await r.clone().text()}`);
  return r.json();
}
async function main() {
  assert.equal((await request('/api/dashboard')).status, 401);
  assert.equal((await request('/api/animal/1')).status, 401);
  const anon = await request('/gestao');
  assert.ok([307, 308].includes(anon.status));
  assert.equal(anon.headers.get('location'), '/login');
  assert.equal(
    (
      await request('/api/auth/login', undefined, 'POST', {
        email: 'cliente@clinicavet.test',
        password: 'errada',
      })
    ).status,
    401,
  );
  const admin = await login('admin@clinicavet.test'),
    rececao = await login('rececao@clinicavet.test'),
    vet = await login('vet@clinicavet.test'),
    client = await login('cliente@clinicavet.test'),
    client2 = await login('cliente2@clinicavet.test');
  const own = await json('/api/animal', client),
    other = await json('/api/animal', client2);
  assert.ok(own.rows.length);
  assert.ok(other.rows.length);
  assert.ok(own.rows.every((r: { id_dono: number }) => r.id_dono === 1));
  assert.ok(other.rows.every((r: { id_dono: number }) => r.id_dono === 3));
  assert.equal((await request(`/api/animal/${other.rows[0].id_animal}`, client)).status, 404);
  const ownConsults = await json('/api/consulta', client);
  assert.ok(ownConsults.rows.every((r: { id_dono: number }) => r.id_dono === 1));
  const vetConsults = await json('/api/consulta', vet);
  assert.ok(vetConsults.rows.every((r: { id_veterinario: number }) => r.id_veterinario === 1));
  const foreign = (await json('/api/consulta?vet=2', admin)).rows[0];
  assert.ok(foreign);
  assert.equal((await request(`/api/consulta/${foreign.id_consulta}`, vet)).status, 404);
  assert.equal(
    (await request(`/api/consulta/${foreign.id_consulta}`, vet, 'PATCH', { notas: 'indevido' }))
      .status,
    404,
  );
  const receptionConsult = await json(`/api/consulta/${foreign.id_consulta}`, rececao);
  assert.equal(receptionConsult.item.notas, undefined);
  assert.equal(receptionConsult.extras.diagnosticos.length, 0);
  assert.equal((await request('/api/veterinario/1', client)).status, 403);
  assert.equal((await json('/api/veterinario/1', vet)).item.salario_base, undefined);
  assert.ok((await json('/api/veterinario/1', admin)).item.salario_base);
  assert.equal((await json('/api/dono/1', vet)).item.nif, undefined);
  assert.equal((await request('/api/users', rececao)).status, 403);
  assert.equal((await request('/api/users', client)).status, 403);
  assert.equal((await request('/api/animal', client, 'POST', {})).status, 403);
  assert.equal(
    (await request(`/api/consulta/${foreign.id_consulta}`, rececao, 'PATCH', { notas: 'indevido' }))
      .status,
    403,
  );
  assert.equal(
    (
      await request(
        '/api/veterinario/1',
        admin,
        'PATCH',
        { nome: 'indevido' },
        'https://exemplo.test',
      )
    ).status,
    403,
  );
  assert.equal((await request('/api/desconhecido/1', admin)).status, 404);
  assert.equal((await request('/api/animal/NaN', admin)).status, 404);
  assert.equal((await request('/api/me', client, 'PATCH', { ownerId: 2 })).status, 400);
  const filtered = await json('/api/consulta?estado=Faltou&tipo=Vacinação', admin);
  assert.ok(
    filtered.rows.every(
      (r: { estado: string; tipo: string }) => r.estado === 'Faltou' && r.tipo === 'Vacinação',
    ),
  );
  const searched = await json('/api/animal?search=Fumaça', admin);
  assert.ok(searched.rows.some((r: { nome: string }) => r.nome === 'Fumaça'));
  assert.equal((await json('/api/animal?search=%27%20OR%201%3D1%20--', admin)).total, 0);
  const page2 = await json('/api/dono?page=2', admin);
  assert.equal(page2.page, 2);
  assert.ok(page2.rows.length);
  console.log('✓ APIs: sessões, proteção de campos, isolamento e filtros.');
  const adminPaths = [
    '/gestao',
    '/gestao/dono',
    '/gestao/animal',
    '/gestao/veterinario',
    '/gestao/consulta',
    '/gestao/utilizadores',
    '/gestao/dono/1',
    '/gestao/animal/1',
    '/gestao/veterinario/1',
    `/gestao/consulta/${foreign.id_consulta}`,
    '/gestao/dono/novo',
    '/gestao/animal/novo',
    '/gestao/veterinario/novo',
    '/gestao/consulta/novo',
    '/gestao/animal/1/editar',
  ];
  for (const path of adminPaths) {
    const r = await request(path, admin);
    assert.equal(r.status, 200, `${path}: ${await r.clone().text()}`);
    const html = await r.text();
    assert.ok(!html.includes('Não foi possível carregar os registos.'), path);
  }
  for (const path of [
    '/portal',
    '/portal/animal',
    '/portal/consulta',
    '/portal/perfil',
    `/portal/animal/${own.rows[0].id_animal}`,
  ]) {
    const r = await request(path, client);
    assert.equal(r.status, 200, path);
    const html = await r.text();
    assert.ok(!html.includes('Utilizadores e acessos'), path);
    assert.ok(!html.includes('Espaço de trabalho'), path);
  }
  assert.equal((await request('/gestao', client)).headers.get('location'), '/portal');
  assert.equal((await request('/portal', admin)).headers.get('location'), '/gestao');
  const deniedPage = await request('/gestao/veterinario/novo', rececao);
  const deniedHtml = await deniedPage.text();
  // Com streaming, Next pode devolver 200 e renderizar a página de não encontrado.
  assert.ok(deniedHtml.includes('Não encontrámos esta página.'));
  assert.ok(!deniedHtml.includes('id="salario_base"'));
  console.log(
    '✓ Autenticação, páginas, pesquisa, filtros, paginação, isolamento entre clientes, campos restritos e controlo de acessos.',
  );
  if (write) {
    const tag = Date.now().toString(),
      suffix = tag.slice(-8);
    async function create(resource: string, data: unknown) {
      const r = await request(`/api/${resource}`, admin, 'POST', data);
      assert.equal(r.status, 201, await r.clone().text());
      return (await r.json()).id as number;
    }
    async function patch(resource: string, id: number, data: unknown, session = admin) {
      const r = await request(`/api/${resource}/${id}`, session, 'PATCH', data);
      assert.equal(r.status, 200, await r.clone().text());
    }
    const owner = await create('dono', {
      nome: `Tutor Formação ${tag}`,
      nif: `8${suffix}`,
      data_nascimento: '1990-01-01',
      morada: 'Rua Fictícia 1',
      codigo_postal: '1000-001',
      localidade: 'Lisboa',
      telefone: '900000001',
      telefone_alternativo: null,
      email: `formacao.${tag}@example.test`,
      consentimento_email: false,
      observacoes: 'Registo sintético de teste E2E.',
    });
    await patch('dono', owner, { localidade: 'Porto' });
    assert.equal((await json(`/api/dono/${owner}`, admin)).item.localidade, 'Porto');
    const animal = await create('animal', {
      nome: `Demo ${suffix}`,
      id_dono: owner,
      id_raca: null,
      sexo: 'M',
      data_nascimento: '2020-01-01',
      data_obito: null,
      peso_kg: 5.5,
      esterilizado: false,
      microchip: null,
      observacoes: 'Animal fictício.',
    });
    await patch('animal', animal, { peso_kg: 6.25 }, vet);
    assert.equal((await json(`/api/animal/${animal}`, admin)).item.peso_kg, '6.25');
    const invalid = await request(`/api/animal/${animal}`, admin, 'PATCH', {
      data_obito: '2010-01-01',
    });
    assert.equal(invalid.status, 400);
    assert.equal((await json(`/api/animal/${animal}`, admin)).item.data_obito, null);
    const veterinarian = await create('veterinario', {
      nome: `Veterinário Formação ${tag}`,
      cedula: `T${suffix}`,
      especialidade: null,
      id_supervisor: 1,
      data_admissao: '2026-01-01',
      salario_base: 1500,
      email: `vet.${tag}@example.test`,
      telemovel: null,
      ativo: true,
    });
    await patch('veterinario', veterinarian, { especialidade: 'Clínica de formação' });
    assert.equal(
      (await json(`/api/veterinario/${veterinarian}`, admin)).item.especialidade,
      'Clínica de formação',
    );
    assert.equal(
      (
        await request(`/api/veterinario/${veterinarian}`, admin, 'PATCH', {
          id_supervisor: veterinarian,
        })
      ).status,
      400,
    );
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const consultData = {
      id_animal: animal,
      id_veterinario: 1,
      data_hora: date,
      tipo: 'Rotina',
      motivo: 'Demonstração E2E com dados sintéticos',
      valor_consulta: 30,
      estado: 'Realizada',
      peso_registado: 6.25,
      notas: 'Nota clínica de formação.',
    };
    const consultation = await create('consulta', consultData);
    await patch('consulta', consultation, { notas: 'Nota atualizada pelo veterinário.' }, vet);
    assert.equal(
      (await json(`/api/consulta/${consultation}`, vet)).item.notas,
      'Nota atualizada pelo veterinário.',
    );
    assert.equal((await request('/api/consulta', admin, 'POST', consultData)).status, 400);
    assert.equal((await request(`/api/animal/${animal}`, client)).status, 404);
    const detail = await json(`/api/consulta/${consultation}`, admin);
    assert.equal(detail.item.id_dono, owner);
    const accountEmail = `cliente.e2e.${tag}@example.test`;
    const accountData = {
      name: 'Cliente de formação E2E',
      email: accountEmail,
      password: 'Formacao2026!',
      role: 'cliente',
      ownerId: owner,
      vetId: null,
    };
    assert.equal((await request('/api/users', admin, 'POST', accountData)).status, 201);
    assert.equal((await request('/api/users', admin, 'POST', accountData)).status, 400);
    const demoClient = await login(accountEmail);
    const demoAnimals = await json('/api/animal', demoClient);
    assert.equal(demoAnimals.total, 1);
    assert.equal(demoAnimals.rows[0].id_animal, animal);
    assert.equal(
      (
        await request('/api/me', demoClient, 'PATCH', {
          telefone: '900000002',
          consentimento_email: true,
        })
      ).status,
      200,
    );
    assert.equal((await json(`/api/dono/${owner}`, admin)).item.telefone, '900000002');
    const demoAccount = (await json('/api/users', admin)).find(
      (u: { email: string }) => u.email === accountEmail,
    );
    assert.ok(demoAccount);
    assert.equal(
      (await request('/api/users', admin, 'PATCH', { id: demoAccount.id, active: false })).status,
      200,
    );
    assert.equal((await request('/api/me', demoClient)).status, 401);
    await request('/api/auth/logout', demoClient, 'POST', {});
    console.log(
      '✓ Criação de conta, contactos do portal e revogação imediata de acesso ao desativar a conta de teste.',
    );
    console.log(
      `✓ Criação e edição reais. Registos sintéticos preservados: dono #${owner}, animal #${animal}, veterinario #${veterinarian}, consulta #${consultation}.`,
    );
  }
  const savedCookie = client.cookie;
  assert.equal((await request('/api/auth/logout', client, 'POST', {})).status, 200);
  assert.equal((await request('/api/me', { cookie: savedCookie })).status, 401);
  console.log('✓ Logout revoga a sessão, incluindo reutilização do cookie antigo.');
  for (const session of [admin, rececao, vet, client2])
    await request('/api/auth/logout', session, 'POST', {});
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
