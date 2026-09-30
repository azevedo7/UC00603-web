# ClínicaVet - aplicação local de formação

Uma aplicação completa para a Clínica Veterinária do Areeiro, criada para demonstrar aos formandos da UC00603 como SQL dá origem a uma aplicação real: pesquisa, fichas relacionadas, formulários, histórico, autenticação e permissões.

Stack: **Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, componentes oficiais shadcn/ui, MySQL e Zod**. A interface está em português de Portugal e adapta-se a telemóvel e computador. Não depende de fontes, imagens ou serviços externos para funcionar.

## Iniciar

Requer Node.js 22.13 ou superior, npm e o MySQL local com a base `clinicavet` **já existente**, com os dados sintéticos da UC.

```bash
git clone https://github.com/azevedo7/UC00603-web.git
cd UC00603-web
npm ci
cp .env.example .env.local
```

Se já estiver na pasta `clinicavet-app` da UC, execute os comandos npm nessa pasta, sem voltar a clonar o repositório.

Se `.env.local` já existir, conserve-o. Preencha a ligação à base existente:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=a_sua_conta_mysql
DB_PASSWORD=a_sua_palavra_passe_mysql
DB_NAME=clinicavet
COOKIE_SECURE=false
```

A aplicação fixa o nome da base em `clinicavet`. A conta MySQL precisa de `SELECT`, `INSERT` e `UPDATE` nas tabelas usadas; não precisa de permissões de criação, alteração de esquema ou eliminação. Não são criadas contas MySQL nem alterados os seus privilégios pela aplicação.

```bash
npm run setup:demo
npm run dev
```

Abra [http://127.0.0.1:3000](http://127.0.0.1:3000).

`setup:demo` lê apenas os donos #1 e #3 e o veterinário ativo #1 para associar as contas de demonstração aos registos fictícios. Cria contas locais em `.data/accounts.json` e preserva as contas já existentes, incluindo as respetivas palavras-passe. **Não insere nem altera qualquer dado MySQL.** Se esses identificadores não existirem, termina com uma mensagem de erro.

Para uma demonstração com a versão compilada:

```bash
npm run build
npm start
```

Pode usar outra porta com `npm run dev -- --port 3100` ou `npm start -- --port 3100`. O servidor fica ligado apenas a `127.0.0.1` por omissão.

## Credenciais de demonstração

A palavra-passe inicial de **todas** as contas abaixo é **`Formacao2026!`**.

| Email                      | Perfil        | Área inicial | Associação à base                |
| -------------------------- | ------------- | ------------ | -------------------------------- |
| `admin@clinicavet.test`    | Administração | `/gestao`    | Toda a clínica                   |
| `rececao@clinicavet.test`  | Receção       | `/gestao`    | Operações da receção             |
| `vet@clinicavet.test`      | Veterinário   | `/gestao`    | `veterinario.id_veterinario = 1` |
| `cliente@clinicavet.test`  | Cliente       | `/portal`    | `dono.id_dono = 1`               |
| `cliente2@clinicavet.test` | Cliente       | `/portal`    | `dono.id_dono = 3`               |

Estas credenciais são intencionalmente públicas para as demonstrações com os formandos, incluindo a instalação em `clinicavet.jfazevedo.pt`, e utilizam exclusivamente dados fictícios. Os participantes partilham as mesmas contas e os registos de formação.

Termine a sessão com **Sair** antes de testar outro perfil. Para mostrar perfis ao mesmo tempo, use perfis separados do navegador ou uma janela privada. Separadores da mesma sessão de navegador partilham o cookie de autenticação.

## O que cada perfil vê e pode fazer

| Funcionalidade                        | Administração                                  | Receção                                                 | Veterinário                                                                                   | Cliente                                                    |
| ------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Painel de gestão                      | Toda a clínica                                 | Toda a clínica                                          | Contagens da clínica e consultas próprias                                                     | Portal próprio, com contagens e histórico dos seus animais |
| Clientes                              | Lista, pesquisa, criação, edição e ficha       | Lista, pesquisa, criação, edição e ficha                | Leitura dos nomes e contactos essenciais; sem NIF, nascimento, morada ou observações do tutor | Apenas a sua ficha e contactos                             |
| Animais                               | Lista, pesquisa, criação, edição e histórico   | Cria e edita identificação; sem observações clínicas    | Lê os pacientes; edita peso, esterilização, óbito e observações                               | Apenas os seus animais, fichas e histórico                 |
| Veterinários                          | Criação, edição, supervisão, salários e fichas | Leitura profissional, sem salários                      | Leitura profissional, sem salários                                                            | Nome do veterinário nas consultas dos seus animais         |
| Consultas                             | Todas; criação e edição integral               | Todas; criação e edição operacional, sem notas clínicas | Apenas as atribuídas a si; cria consultas próprias e edita tipo, motivo, estado, peso e notas | Apenas consultas dos seus animais, em leitura              |
| Diagnósticos e tratamentos existentes | Leitura no detalhe                             | Sem acesso                                              | Leitura das suas consultas                                                                    | Leitura das consultas dos seus animais                     |
| Pagamento existente                   | Leitura no detalhe                             | Leitura no detalhe                                      | Leitura das suas consultas                                                                    | Leitura das consultas dos seus animais                     |
| Contas de acesso                      | Lista, criação, ativação e desativação         | Sem acesso                                              | Sem acesso                                                                                    | Sem acesso                                                 |

A administração pode criar contas de cada perfil em **Utilizadores e acessos**. Uma conta de cliente tem de estar ligada a um dono existente; uma conta de veterinário a um veterinário ativo. A própria conta do administrador não pode ser desativada por ele. Desativar uma conta invalida imediatamente o seu acesso, mesmo que tenha uma sessão aberta. Não há registo público de contas.

O email de contacto em `dono.email` é independente do email usado para autenticação. Alterar contactos no portal não altera o login.

## Ecrãs

- **Clientes:** pesquisa por nome, NIF ou email; formulário com os campos do esquema; ficha com os animais associados.
- **Animais:** pesquisa por nome, tutor ou microchip; raça associada à espécie por `raca`; ficha com o tutor e histórico de consultas.
- **Veterinários:** pesquisa por nome, cédula ou especialidade; criação e edição com supervisor e estado ativo; ficha com consultas. A aplicação impede supervisão de si próprio e ciclos na hierarquia.
- **Consultas:** pesquisa, filtros por estado, tipo, intervalo de datas e veterinário; criação, edição e detalhe com animal, dono, profissional, data, motivo, estado, valor, peso e notas conforme o perfil. Paginação de 12 registos por página.
- **Portal:** navegação e desenho próprios, cartões dos animais do cliente, consultas, fichas e formulário para atualizar contactos e consentimento.

Os diagnósticos, tratamentos e pagamentos são apresentados a partir das tabelas existentes, em leitura. A coluna gerada `consulta_tratamento.valor_linha` é lida do MySQL. O valor mostrado inclui o ato de consulta e os tratamentos; um pagamento registado pode ser parcial.

## Respeito pelo esquema e pelos dados

Antes de implementar foram lidos os ficheiros originais da UC. O esquema de referência está em [clinicavet_schema.sql](docs/sql/clinicavet_schema.sql). O dicionário completo encontra-se nos materiais originais da UC.

O conjunto de dados de formação, as capturas com históricos e o dicionário com exemplos nominativos não são distribuídos neste repositório público. Use a base `clinicavet` já carregada com os materiais da UC.

Estes ficheiros são material de consulta. O esquema original contém `DROP DATABASE`; não o execute sobre uma base existente. A aplicação e a preparação das contas não executam estes ficheiros.

- A aplicação **não executa** o ficheiro de criação ou de carregamento da base, não altera o esquema, não cria tabelas e não apaga registos.
- Usa os identificadores originais: `dono`, `animal`, `veterinario`, `consulta`, `raca`, `especie` e as relações clínicas existentes.
- Todos os `SELECT`, `INSERT` e `UPDATE` recebem valores parametrizados. Os identificadores SQL são escolhidos a partir de uma lista fechada.
- Campos opcionais vazios são guardados como `NULL`. O consentimento começa desativado. As datas, os comprimentos, os valores monetários e os formatos de contactos respeitam as restrições existentes.
- Os preços e salários são guardados em `DECIMAL` pela base; a aplicação não altera os tipos das colunas. As escritas têm no máximo duas casas decimais.
- O mesmo veterinário não pode ter duas consultas à mesma data e hora. A restrição `uq_consulta_vet_hora` continua a garantir esta regra.
- Novas consultas só podem ser atribuídas a veterinários ativos. Uma consulta histórica pode manter o seu veterinário entretanto inativo.
- Os únicos estados existentes são **Realizada**, **Faltou** e **Anulada**. Não existe “Agendada” ou “Pendente”. O formulário regista a consulta e o seu resultado; o portal orienta o cliente para contactar a receção para marcações.
- A espécie do animal deriva da raça. Um animal sem raça registada não recebe uma espécie inventada.

Guardar um formulário cria ou atualiza efetivamente registos na base existente. Para a aula, use apenas informação sintética. A aplicação não inclui ações de eliminação.

## Como funciona a autenticação

O esquema original não contém utilizadores ou sessões. Para o preservar, a autenticação usa ficheiros locais:

- `.data/accounts.json`: contas, perfis, ligações a dono/veterinário e hashes `scrypt` com sal aleatório; não guarda palavras-passe em texto simples.
- `.data/sessions/`: sessões com expiração de oito horas. O navegador recebe um token aleatório de 256 bits; o nome do ficheiro usa o seu SHA-256.
- Cookie `HttpOnly`, `SameSite=Lax`, duração limitada e `Secure` quando `COOKIE_SECURE=true` em HTTPS.
- **Sair** elimina a sessão no servidor; o cookie antigo deixa de dar acesso.
- Cinco tentativas de login falhadas para um email provocam um bloqueio de 15 minutos no processo local.
- Escritas HTTP exigem JSON e uma origem igual à da aplicação, protegendo os formulários de pedidos de outros sites.
- A autorização é verificada nas páginas e em cada endpoint. Os clientes são filtrados pelo dono associado à sessão, nunca por um dono enviado pelo navegador. Registos de outro cliente respondem como não encontrados.
- As respostas não enviam salários a perfis não administrativos nem notas clínicas à receção.

`.env`, `.env.local` e `.data` estão excluídos do Git. As contas e sessões são persistentes entre reinícios. Guarde a pasta `.data` juntamente com a configuração se pretender conservar os acessos da demonstração. Esta solução destina-se a um servidor local com um único processo e não a uma instalação distribuída.

## Servir através de HTTPS

Num servidor com um proxy inverso, configure a origem pública e o cookie seguro:

```dotenv
APP_URL=https://clinicavet.jfazevedo.pt
COOKIE_SECURE=true
```

O proxy deve conservar o cabeçalho `Host`. A aplicação aceita escritas apenas com a origem pública configurada, mesmo quando o proxy comunica com o servidor Next.js por HTTP privado. Sem `APP_URL`, aceita apenas origens locais. Ligue o servidor à interface privada do contentor com `node node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port 3000`; publique apenas o proxy HTTPS.

Conserve `.data` num diretório persistente, com acesso exclusivo da conta de serviço, e a configuração fora do Git. A instalação pública usa uma cópia da base de formação; a base local permanece intacta.

## Roteiro para mostrar à turma

1. Entre como **administração**. Mostre as contagens e abra um cliente, um animal e uma consulta. Siga as ligações das fichas.
2. Abra **Utilizadores e acessos** e compare os quatro perfis.
3. Entre como **receção**. Mostre que as notas clínicas, salários e gestão de contas não estão disponíveis.
4. Entre como **veterinário**. Mostre que a lista de consultas está limitada ao veterinário #1 e que pode preencher notas das suas consultas.
5. Entre como **cliente**. Mostre o portal, os cartões dos animais, o histórico e o formulário de contactos. A navegação e os ecrãs são diferentes dos da equipa.
6. Copie o URL de um animal do cliente #1. Entre como **cliente2** e abra-o: o registo fica inacessível.
7. Como administração, crie um cliente fictício, associe-lhe um animal e registe uma consulta. Mostre os dados a aparecerem de imediato no MySQL Workbench.
8. Tente repetir um NIF ou a combinação de veterinário e hora. Explique como o `UNIQUE` da base protege os dados mesmo quando uma aplicação se engana.

Exemplos para ligar a interface ao que aprenderam em SQL (apenas leitura):

```sql
-- Relação 1-N: animais e respetivos tutores.
SELECT a.id_animal, a.nome AS animal, d.nome AS tutor
FROM animal a
JOIN dono d ON d.id_dono = a.id_dono
ORDER BY a.nome;

-- LEFT JOIN: preserva animais sem raça identificada.
SELECT a.nome, r.nome_raca, e.nome_especie
FROM animal a
LEFT JOIN raca r ON r.id_raca = a.id_raca
LEFT JOIN especie e ON e.id_especie = r.id_especie;

-- A ficha de consulta nasce da ligação de quatro tabelas.
SELECT c.id_consulta, c.data_hora, a.nome AS animal,
       d.nome AS tutor, v.nome AS veterinario, c.estado
FROM consulta c
JOIN animal a ON a.id_animal = c.id_animal
JOIN dono d ON d.id_dono = a.id_dono
JOIN veterinario v ON v.id_veterinario = c.id_veterinario
ORDER BY c.data_hora DESC;

-- Contagens: clientes sem animais continuam a aparecer.
SELECT d.id_dono, d.nome, COUNT(a.id_animal) AS animais
FROM dono d
LEFT JOIN animal a ON a.id_dono = d.id_dono
GROUP BY d.id_dono, d.nome;
```

## Verificação

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Com a aplicação a correr e as contas de demonstração preparadas:

```bash
npm run test:e2e
# Para outra porta:
E2E_BASE_URL=http://127.0.0.1:3100 npm run test:e2e
```

Os testes E2E usam HTTP real: login, cookies, páginas renderizadas, listas, fichas, pesquisa, filtros, paginação, logout, pedidos sem sessão, proteção de campos e isolamento entre clientes. Não substituem uma inspeção visual no navegador. Por omissão não alteram os dados clínicos.

Para verificar também as escritas reais:

```bash
npm run test:e2e -- --write
```

Esta opção **acrescenta quatro registos sintéticos identificados como Formação/Demo**, um por entidade, e edita apenas os registos que acabou de criar. Testa duplicados, óbito anterior ao nascimento e autossupervisão. Cria também uma conta local de teste, verifica a atualização de contactos do novo cliente e desativa essa conta no final. Mantém os registos de demonstração na base e imprime os seus identificadores; não elimina dados existentes ou dados de teste. Repetir o teste acrescenta novos registos.

## Validação desta entrega

Em 29/09/2026 passaram o lint, a verificação TypeScript, sete testes de segurança, a compilação e os testes integrados HTTP de páginas, autenticação, permissões, pesquisa, filtros, criação e edição. A auditoria npm não indicou vulnerabilidades. Foi também testada a criação de uma conta sintética, a edição de contactos no portal e a revogação de acesso ao desativar essa conta.

Os testes de escrita acrescentaram apenas `dono #61`, `animal #91`, `veterinario #11` e `consulta #257`. As contagens passaram de 60 para 61 clientes, de 90 para 91 animais, de 10 para 11 veterinários e de 251 para 252 consultas. A conta extra de teste ficou desativada. A revisão visual no navegador ficou pendente de autorização nesta sessão; a renderização das páginas foi validada por HTTP.

## Organização

```text
docs/sql/              esquema de referência da UC
app/login/             autenticação
app/gestao/            painel e CRUD da equipa
app/portal/            área exclusiva dos clientes
app/api/               endpoints protegidos
components/ui/         componentes oficiais shadcn/ui
components/            formulários, listas, fichas e navegação
lib/queries.ts         consultas SQL, âmbito por perfil e transações
lib/validation.ts      validação no servidor e permissões de campos
lib/auth.ts            sessões, login e logout
lib/account-store.ts   armazenamento local e hashes de palavras-passe
scripts/setup-demo.ts  preparação idempotente das contas
scripts/test-e2e.ts    testes integrados HTTP
```

## Problemas frequentes

- **MySQL indisponível:** inicie o serviço local e confirme host e porta. O cliente de terminal pode tentar um socket diferente; a aplicação usa TCP.
- **Conta MySQL recusada / escrita recusada:** reveja `DB_USER`, `DB_PASSWORD` e os privilégios da conta existente. A aplicação não modifica permissões da base.
- **Ainda não existem contas:** execute `npm run setup:demo` depois de configurar `.env.local`.
- **Valores duplicados:** escolha outro NIF, email, cédula ou microchip. Para consultas, escolha outra data/hora para o veterinário.
- **Cookie não chega ao servidor local:** em HTTP use `COOKIE_SECURE=false`. Use sempre o mesmo host para navegar e testar: `localhost` e `127.0.0.1` são origens diferentes.
- **Login temporariamente bloqueado:** aguarde 15 minutos após cinco tentativas falhadas. O bloqueio é local ao processo.
- **Consulta não aparece ao cliente:** confirme que o animal pertence ao `id_dono` ligado à sua conta. Para um veterinário, confirme `id_veterinario`.

## Fontes técnicas

A implementação segue a documentação oficial de [autenticação do Next.js](https://nextjs.org/docs/app/guides/authentication), [segurança de dados do Next.js](https://nextjs.org/docs/app/guides/data-security) e [shadcn/ui](https://ui.shadcn.com/docs/installation).
