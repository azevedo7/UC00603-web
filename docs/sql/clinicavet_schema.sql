-- =====================================================================
-- clinicavet — Base de dados de contexto para a UC00603
-- «Criar a estrutura de uma base de dados e programar em SQL»
--
-- SGBD alvo: MySQL 8.4 LTS
-- Ficheiro 1 de 3: ESTRUTURA (DDL)
--   1. clinicavet_schema.sql      <- este ficheiro
--   2. clinicavet_dados.sql       <- correr a seguir
--   3. clinicavet_dicionario.md   <- documentação
--
-- Como correr, a partir da linha de comandos:
--   mysql -u root -p < clinicavet_schema.sql
--   mysql -u root -p < clinicavet_dados.sql
-- Ou, no MySQL Workbench: abrir o ficheiro e executar (raio).
--
-- NOTA DE LEITURA PARA O FORMANDO
-- Os comentários deste ficheiro não explicam só o que o SQL faz — explicam
-- porque é que foi escrito assim. Cada decisão de desenho tem alternativa;
-- quando a alternativa é defensável, está dita.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. CRIAÇÃO DA BASE DE DADOS
-- ---------------------------------------------------------------------
-- DROP DATABASE IF EXISTS torna o ficheiro repetível: pode ser corrido
-- vezes sem conta e o resultado é sempre o mesmo. É prática normal em
-- ficheiros de aula. NUNCA em produção — apaga tudo sem perguntar.
DROP DATABASE IF EXISTS clinicavet;

-- utf8mb4 é o único conjunto de caracteres a usar em MySQL moderno:
-- guarda todo o Unicode (4 bytes por carácter no máximo), incluindo
-- «ç», «ã», «É» e emoji. O antigo «utf8» do MySQL era utf8mb3 e ficava-se
-- por 3 bytes — evitar sempre.
--
-- A colação utf8mb4_0900_ai_ci define como se COMPARA e ORDENA texto:
--   0900 = regras Unicode 9.0
--   ai   = accent insensitive  -> 'José' = 'Jose'
--   ci   = case insensitive    -> 'josé' = 'JOSÉ'
-- É a colação por omissão do MySQL 8 e a escolhida aqui de propósito:
-- há dados inseridos que só diferem no acento ou na caixa, para se ver
-- na prática o que esta colação considera «igual».
CREATE DATABASE clinicavet
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE clinicavet;


-- ---------------------------------------------------------------------
-- 1. especie — tabela de referência (lookup)
-- ---------------------------------------------------------------------
-- Porquê uma tabela só para isto, em vez de escrever «Canídeo» dentro da
-- tabela animal? Porque «Canídeo», «canideo», «Cão» e «CANIDEO» acabariam
-- todos na mesma coluna, escritos por pessoas diferentes. Uma tabela de
-- referência com chave estrangeira torna esse erro impossível: só entra
-- o que já lá está. É o primeiro passo da normalização.
CREATE TABLE especie (
    id_especie          TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    -- TINYINT UNSIGNED chega para 255 espécies. Escolher o tipo mais
    -- pequeno que serve não é avareza: índices menores = leituras mais
    -- rápidas.
    nome_especie        VARCHAR(40)  NOT NULL,
    nome_cientifico     VARCHAR(60)      NULL,   -- nem sempre registado
    esperanca_vida_anos TINYINT UNSIGNED NULL,   -- valor indicativo

    CONSTRAINT pk_especie        PRIMARY KEY (id_especie),
    CONSTRAINT uq_especie_nome   UNIQUE (nome_especie),
    -- CHECK só é validado quando o valor NÃO é NULL: em MySQL, uma
    -- condição que dá UNKNOWN não faz falhar o CHECK. Ainda assim
    -- escreve-se «IS NULL OR ...» por clareza para quem lê.
    CONSTRAINT ck_especie_vida   CHECK (esperanca_vida_anos IS NULL
                                        OR esperanca_vida_anos BETWEEN 1 AND 200)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- ENGINE=InnoDB em todas as tabelas: é o único motor do MySQL que suporta
-- chaves estrangeiras e transações. MyISAM aceita a sintaxe FOREIGN KEY
-- e ignora-a em silêncio — armadilha clássica.


-- ---------------------------------------------------------------------
-- 2. raca — depende de especie (relação 1-N)
-- ---------------------------------------------------------------------
CREATE TABLE raca (
    id_raca     SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_especie  TINYINT  UNSIGNED NOT NULL,   -- tipo IGUAL ao da chave referida
    nome_raca   VARCHAR(60)       NOT NULL,
    porte       ENUM('Pequeno','Médio','Grande') NULL,
    -- ENUM guarda internamente um número e mostra texto. Cabe bem em
    -- listas curtas e estáveis. Se a lista mudar com frequência,
    -- prefere-se uma tabela de referência (como especie).

    CONSTRAINT pk_raca      PRIMARY KEY (id_raca),
    -- UNIQUE composto: pode existir «Persa» em gatos e «Persa» noutra
    -- espécie, mas não duas vezes na mesma espécie.
    CONSTRAINT uq_raca_especie_nome UNIQUE (id_especie, nome_raca),
    CONSTRAINT fk_raca_especie FOREIGN KEY (id_especie)
        REFERENCES especie (id_especie)
        ON UPDATE CASCADE      -- se o id da espécie mudar, as raças acompanham
        ON DELETE RESTRICT     -- não deixa apagar uma espécie que tem raças
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ---------------------------------------------------------------------
-- 3. dono — o lado «1» da relação 1-N com animal
-- ---------------------------------------------------------------------
-- Esta é a tabela mais sensível do esquema em matéria de RGPD: é toda ela
-- dados pessoais de pessoas singulares identificadas. Ver a secção
-- «Dados pessoais e RGPD» do dicionário de dados.
CREATE TABLE dono (
    id_dono              SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome                 VARCHAR(80)  NOT NULL,
    -- Um só campo «nome» e não «nome próprio» + «apelido»: os nomes
    -- portugueses têm um número variável de elementos e a separação
    -- gera mais problemas do que resolve.
    -- Repare-se que NÃO há UNIQUE em nome — duas pessoas diferentes podem
    -- chamar-se o mesmo. O identificador único da pessoa é o NIF.

    nif                  CHAR(9)      NOT NULL,
    -- CHAR(9) e não INT: um NIF nunca é objeto de cálculo, pode começar
    -- por zero em alguns casos e tem comprimento fixo. Regra prática:
    -- se não se soma nem multiplica, não é número — é texto.

    data_nascimento      DATE         NOT NULL,
    morada               VARCHAR(120) NOT NULL,
    codigo_postal        CHAR(8)      NOT NULL,   -- formato ####-###
    localidade           VARCHAR(60)  NOT NULL,
    telefone             CHAR(9)      NOT NULL,
    telefone_alternativo CHAR(9)          NULL,   -- NULL = «não forneceu»
    email                VARCHAR(120)     NULL,   -- NULL = «não tem / não deu»
    consentimento_email  BOOLEAN      NOT NULL DEFAULT FALSE,
    -- BOOLEAN em MySQL é sinónimo de TINYINT(1): guarda 0 ou 1.
    -- O DEFAULT FALSE não é detalhe técnico — é a regra do RGPD:
    -- o consentimento tem de ser um ato positivo, nunca a omissão.

    data_registo         DATE         NOT NULL DEFAULT (CURRENT_DATE),
    -- DEFAULT com expressão (entre parênteses) só existe a partir do
    -- MySQL 8.0.13. Serve para a retenção: sabe-se desde quando os dados
    -- estão guardados e quando devem ser eliminados.
    observacoes          VARCHAR(255)     NULL,

    CONSTRAINT pk_dono       PRIMARY KEY (id_dono),
    CONSTRAINT uq_dono_nif   UNIQUE (nif),
    CONSTRAINT uq_dono_email UNIQUE (email),
    -- Ponto importante para a aula sobre NULL: em MySQL, uma restrição
    -- UNIQUE permite VÁRIAS linhas com NULL, porque dois NULL não são
    -- «iguais» — são ambos «desconhecido». Só os emails preenchidos têm
    -- de ser distintos entre si.

    CONSTRAINT ck_dono_nif   CHECK (nif REGEXP '^[0-9]{9}$'),
    CONSTRAINT ck_dono_cp    CHECK (codigo_postal REGEXP '^[0-9]{4}-[0-9]{3}$'),
    CONSTRAINT ck_dono_tel   CHECK (telefone REGEXP '^[239][0-9]{8}$'),
    CONSTRAINT ck_dono_tel2  CHECK (telefone_alternativo IS NULL
                                    OR telefone_alternativo REGEXP '^[239][0-9]{8}$'),
    -- Validação de email «suficiente»: obriga a haver alguma coisa antes
    -- do @, alguma coisa depois e um ponto no domínio. Validar email a
    -- sério com uma expressão regular é um exercício de frustração —
    -- a validação verdadeira é enviar mensagem e ver se chega.
    CONSTRAINT ck_dono_email CHECK (email IS NULL OR email LIKE '%_@_%._%'),
    CONSTRAINT ck_dono_nasc  CHECK (data_nascimento BETWEEN '1900-01-01' AND '2012-12-31')
    -- Um dono tem de ser maior de idade para assinar; a fronteira de cima
    -- é conservadora e serve sobretudo para apanhar gralhas de digitação
    -- (o clássico 2205 em vez de 1955).
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_dono_nome       ON dono (nome);
CREATE INDEX idx_dono_localidade ON dono (localidade);
-- Índices em colunas muito usadas no WHERE e no ORDER BY. As colunas com
-- PRIMARY KEY ou UNIQUE já têm índice automático — não se repete.


-- ---------------------------------------------------------------------
-- 4. veterinario — relação AUTO-REFERENCIAL (self join)
-- ---------------------------------------------------------------------
-- Um veterinário pode ser supervisionado por outro veterinário. A chave
-- estrangeira aponta para a própria tabela. É isto que permite ensinar
-- o self join:
--
--   SELECT v.nome AS veterinario, s.nome AS supervisor
--   FROM veterinario AS v
--   LEFT JOIN veterinario AS s ON v.id_supervisor = s.id_veterinario;
--
-- Com LEFT JOIN aparece também a diretora clínica, que não tem supervisor
-- (id_supervisor IS NULL). Com INNER JOIN ela desaparece — e essa é
-- exatamente a diferença que se quer mostrar.
CREATE TABLE veterinario (
    id_veterinario TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome           VARCHAR(80)      NOT NULL,
    cedula         VARCHAR(10)      NOT NULL,   -- cédula da Ordem dos Médicos Veterinários
    especialidade  VARCHAR(50)          NULL,   -- NULL = clínica geral
    id_supervisor  TINYINT UNSIGNED     NULL,   -- NULL = topo da hierarquia
    data_admissao  DATE             NOT NULL,
    salario_base   DECIMAL(8,2)     NOT NULL,
    -- DECIMAL para dinheiro. NUNCA FLOAT nem DOUBLE: vírgula flutuante
    -- não representa exatamente 0,10 em binário e os cêntimos fogem.
    -- DECIMAL(8,2) = até 999.999,99 com dois decimais exatos.
    email          VARCHAR(120)     NOT NULL,
    telemovel      CHAR(9)              NULL,
    ativo          BOOLEAN          NOT NULL DEFAULT TRUE,
    -- «Apagamento lógico»: um veterinário que sai não é apagado, porque
    -- as consultas dele têm de continuar a existir. Marca-se ativo = 0.

    CONSTRAINT pk_veterinario     PRIMARY KEY (id_veterinario),
    CONSTRAINT uq_vet_cedula      UNIQUE (cedula),
    CONSTRAINT uq_vet_email       UNIQUE (email),
    CONSTRAINT fk_vet_supervisor  FOREIGN KEY (id_supervisor)
        REFERENCES veterinario (id_veterinario)
        ON UPDATE CASCADE
        ON DELETE SET NULL,     -- se o supervisor sair, a equipa fica sem chefe,
                                -- mas os registos não se perdem
    CONSTRAINT ck_vet_salario     CHECK (salario_base >= 870.00),
    CONSTRAINT ck_vet_email       CHECK (email LIKE '%_@_%._%'),
    CONSTRAINT ck_vet_telemovel   CHECK (telemovel IS NULL
                                         OR telemovel REGEXP '^9[0-9]{8}$')
    -- LIMITAÇÃO A CONHECER: não é possível escrever aqui
    --     CHECK (id_supervisor <> id_veterinario)
    -- porque o MySQL proíbe referir colunas AUTO_INCREMENT dentro de um
    -- CHECK. A regra «ninguém é supervisor de si próprio» tem de ser
    -- garantida por TRIGGER ou pela aplicação. É um bom exemplo de que
    -- nem tudo o que é regra de negócio cabe numa restrição declarativa.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ---------------------------------------------------------------------
-- 5. animal — o lado «N» da relação 1-N com dono
-- ---------------------------------------------------------------------
CREATE TABLE animal (
    id_animal       SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_dono         SMALLINT UNSIGNED NOT NULL,   -- todo o animal tem dono: NOT NULL
    id_raca         SMALLINT UNSIGNED     NULL,   -- rafeiro/indeterminado: NULL
    nome            VARCHAR(40)       NOT NULL,
    sexo            CHAR(1)           NOT NULL,
    -- Aqui usa-se CHAR(1) + CHECK em vez de ENUM, de propósito: no mesmo
    -- esquema ficam as duas técnicas lado a lado para se poderem comparar.
    data_nascimento DATE                  NULL,   -- NULL = animal recolhido, idade desconhecida
    data_obito      DATE                  NULL,   -- NULL = está vivo  <<< NULL COM SIGNIFICADO
    peso_kg         DECIMAL(5,2)          NULL,   -- último peso conhecido
    esterilizado    BOOLEAN           NOT NULL DEFAULT FALSE,
    microchip       CHAR(15)              NULL,   -- NULL = ainda não implantado
    observacoes     VARCHAR(255)          NULL,

    CONSTRAINT pk_animal       PRIMARY KEY (id_animal),
    CONSTRAINT uq_animal_chip  UNIQUE (microchip),
    CONSTRAINT fk_animal_dono  FOREIGN KEY (id_dono)
        REFERENCES dono (id_dono)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,    -- não se apaga um dono que ainda tem animais;
                               -- obriga a decidir para quem passa o animal
    CONSTRAINT fk_animal_raca  FOREIGN KEY (id_raca)
        REFERENCES raca (id_raca)
        ON UPDATE CASCADE
        ON DELETE SET NULL,    -- se a raça for eliminada do catálogo, o animal
                               -- fica «sem raça registada», que é verdade
    CONSTRAINT ck_animal_sexo  CHECK (sexo IN ('M','F')),
    CONSTRAINT ck_animal_peso  CHECK (peso_kg IS NULL
                                      OR (peso_kg > 0 AND peso_kg < 300)),
    CONSTRAINT ck_animal_chip  CHECK (microchip IS NULL
                                      OR microchip REGEXP '^[0-9]{15}$'),
    -- CHECK que envolve duas colunas da mesma linha: perfeitamente legal
    -- e muito útil. Um animal não pode morrer antes de nascer.
    CONSTRAINT ck_animal_datas CHECK (data_obito IS NULL
                                      OR data_nascimento IS NULL
                                      OR data_obito >= data_nascimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_animal_nome ON animal (nome);
-- Não se cria índice em id_dono nem em id_raca: o InnoDB cria
-- automaticamente um índice para cada chave estrangeira.


-- ---------------------------------------------------------------------
-- 6. diagnostico — catálogo clínico (tabela de referência)
-- ---------------------------------------------------------------------
-- Atenção: esta tabela em si NÃO contém dados pessoais. Contém a lista
-- de diagnósticos possíveis. Os dados de saúde nascem da LIGAÇÃO entre
-- esta tabela e uma consulta concreta (tabela consulta_diagnostico).
CREATE TABLE diagnostico (
    id_diagnostico SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    codigo         VARCHAR(10)       NOT NULL,   -- código interno da clínica
    designacao     VARCHAR(100)      NOT NULL,
    categoria      VARCHAR(40)       NOT NULL,
    gravidade      TINYINT UNSIGNED  NOT NULL DEFAULT 1,   -- 1 = ligeiro ... 5 = crítico
    cronico        BOOLEAN           NOT NULL DEFAULT FALSE,

    CONSTRAINT pk_diagnostico     PRIMARY KEY (id_diagnostico),
    CONSTRAINT uq_diag_codigo     UNIQUE (codigo),
    CONSTRAINT ck_diag_gravidade  CHECK (gravidade BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ---------------------------------------------------------------------
-- 7. tratamento — catálogo de atos clínicos e respetivo preçário
-- ---------------------------------------------------------------------
CREATE TABLE tratamento (
    id_tratamento   SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    codigo          VARCHAR(10) COLLATE utf8mb4_0900_as_cs NOT NULL,
    -- COLAÇÃO DIFERENTE, DE PROPÓSITO, SÓ NESTA COLUNA:
    --   as = accent sensitive, cs = case sensitive
    -- Num código de artigo, «vac01» e «VAC01» devem ser códigos
    -- diferentes — ou, pelo menos, quem procura por 'vac01' não deve
    -- encontrar 'VAC01' por acaso. Mostra que a colação se define ao
    -- nível da base de dados, da tabela OU da coluna, e que a mais
    -- específica ganha. Comparar esta coluna com dono.nome numa junção
    -- daria erro de colações incompatíveis — outro exercício possível.
    designacao      VARCHAR(100)      NOT NULL,
    categoria       ENUM('Consulta','Vacinação','Cirurgia','Exame',
                         'Medicação','Higiene','Internamento') NOT NULL,
    preco_base      DECIMAL(7,2)      NOT NULL,   -- até 99.999,99 €
    duracao_minutos SMALLINT UNSIGNED     NULL,   -- NULL = não aplicável
    requer_jejum    BOOLEAN           NOT NULL DEFAULT FALSE,

    CONSTRAINT pk_tratamento    PRIMARY KEY (id_tratamento),
    CONSTRAINT uq_trat_codigo   UNIQUE (codigo),
    CONSTRAINT ck_trat_preco    CHECK (preco_base >= 0),
    CONSTRAINT ck_trat_duracao  CHECK (duracao_minutos IS NULL
                                       OR duracao_minutos BETWEEN 1 AND 1440)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ---------------------------------------------------------------------
-- 8. consulta — o centro do esquema
-- ---------------------------------------------------------------------
CREATE TABLE consulta (
    id_consulta     MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_animal       SMALLINT  UNSIGNED NOT NULL,
    id_veterinario  TINYINT   UNSIGNED NOT NULL,
    data_hora       DATETIME           NOT NULL,
    -- DATETIME e não TIMESTAMP: TIMESTAMP converte para UTC e volta a
    -- converter conforme o fuso da sessão, e vai só até 2038. Para uma
    -- marcação numa clínica, a hora local é a hora que interessa.
    tipo            ENUM('Rotina','Urgência','Seguimento','Cirurgia','Vacinação')
                    NOT NULL DEFAULT 'Rotina',
    motivo          VARCHAR(150)       NOT NULL,   -- o que o dono disse
    valor_consulta  DECIMAL(7,2)       NOT NULL DEFAULT 0.00,  -- só o ato de consulta
    estado          ENUM('Realizada','Faltou','Anulada') NOT NULL DEFAULT 'Realizada',
    peso_registado  DECIMAL(5,2)           NULL,   -- peso do dia, se pesado
    notas           TEXT                   NULL,   -- texto livre do veterinário

    CONSTRAINT pk_consulta      PRIMARY KEY (id_consulta),
    CONSTRAINT fk_consulta_animal FOREIGN KEY (id_animal)
        REFERENCES animal (id_animal)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_consulta_vet    FOREIGN KEY (id_veterinario)
        REFERENCES veterinario (id_veterinario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    -- Regra de negócio traduzida em restrição: o mesmo veterinário não
    -- pode estar em dois sítios à mesma hora.
    CONSTRAINT uq_consulta_vet_hora UNIQUE (id_veterinario, data_hora),
    CONSTRAINT ck_consulta_valor CHECK (valor_consulta >= 0),
    CONSTRAINT ck_consulta_peso  CHECK (peso_registado IS NULL
                                        OR (peso_registado > 0 AND peso_registado < 300))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_consulta_data        ON consulta (data_hora);
CREATE INDEX idx_consulta_animal_data ON consulta (id_animal, data_hora);
-- O índice composto (id_animal, data_hora) serve a pergunta mais frequente
-- da clínica: «histórico deste animal, por ordem de data». A ordem das
-- colunas num índice composto importa — material do módulo de otimização.


-- ---------------------------------------------------------------------
-- 9. consulta_diagnostico — junção N-N (consultas <-> diagnósticos)
-- ---------------------------------------------------------------------
-- Uma consulta pode fechar com vários diagnósticos; o mesmo diagnóstico
-- aparece em muitas consultas. Sem tabela de junção, o esquema seria
-- forçado a inventar colunas diagnostico1, diagnostico2, diagnostico3 —
-- violação da 1FN e o exemplo canónico de como NÃO fazer.
--
-- ESTAS LINHAS SÃO DADOS DE SAÚDE. Cruzadas com animal -> dono,
-- identificam uma pessoa. Ver a secção RGPD do dicionário.
CREATE TABLE consulta_diagnostico (
    id_consulta        MEDIUMINT UNSIGNED NOT NULL,
    id_diagnostico     SMALLINT  UNSIGNED NOT NULL,
    principal          BOOLEAN            NOT NULL DEFAULT FALSE,
    observacao_clinica VARCHAR(255)           NULL,

    -- Chave primária COMPOSTA pelas duas chaves estrangeiras: garante que
    -- o mesmo diagnóstico não é lançado duas vezes na mesma consulta, e
    -- dispensa uma coluna de id artificial que ninguém usaria.
    CONSTRAINT pk_consulta_diagnostico PRIMARY KEY (id_consulta, id_diagnostico),
    CONSTRAINT fk_cd_consulta FOREIGN KEY (id_consulta)
        REFERENCES consulta (id_consulta)
        ON UPDATE CASCADE
        ON DELETE CASCADE,     -- a linha só existe por causa da consulta:
                               -- apagada a consulta, apaga-se com ela
    CONSTRAINT fk_cd_diagnostico FOREIGN KEY (id_diagnostico)
        REFERENCES diagnostico (id_diagnostico)
        ON UPDATE CASCADE
        ON DELETE RESTRICT     -- não se apaga do catálogo um diagnóstico já usado
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_cd_diagnostico ON consulta_diagnostico (id_diagnostico);


-- ---------------------------------------------------------------------
-- 10. consulta_tratamento — junção N-N COM ATRIBUTOS PRÓPRIOS
-- ---------------------------------------------------------------------
-- A tabela de junção que mais interessa pedagogicamente: além de ligar
-- as duas tabelas, guarda informação que não pertence nem a uma nem a
-- outra. A quantidade, o preço praticado e o desconto só existem no
-- cruzamento «este tratamento, nesta consulta».
--
-- Porquê copiar o preço para aqui, se ele já está em tratamento.preco_base?
-- Não é redundância indevida — é PREÇO HISTÓRICO. Se o preçário subir,
-- as faturas antigas têm de continuar a mostrar o que foi cobrado na
-- altura. Distinguir «cópia errada» de «registo do momento» é uma das
-- ideias mais úteis da normalização aplicada.
CREATE TABLE consulta_tratamento (
    id_consulta          MEDIUMINT UNSIGNED NOT NULL,
    id_tratamento        SMALLINT  UNSIGNED NOT NULL,
    quantidade           TINYINT   UNSIGNED NOT NULL DEFAULT 1,
    preco_unitario       DECIMAL(7,2)       NOT NULL,
    desconto_percentagem DECIMAL(5,2)       NOT NULL DEFAULT 0.00,
    valor_linha          DECIMAL(9,2) AS (
                             ROUND(quantidade * preco_unitario
                                   * (1 - desconto_percentagem / 100), 2)
                         ) VIRTUAL,
    -- COLUNA GERADA (generated column). Não se insere nem se atualiza:
    -- o MySQL calcula-a ao ler. VIRTUAL = calculada na leitura, não ocupa
    -- espaço; STORED = calculada na escrita e guardada. Evita a
    -- inconsistência clássica de guardar um total que deixa de bater
    -- certo com as parcelas.
    observacoes          VARCHAR(255)           NULL,

    CONSTRAINT pk_consulta_tratamento PRIMARY KEY (id_consulta, id_tratamento),
    CONSTRAINT fk_ct_consulta FOREIGN KEY (id_consulta)
        REFERENCES consulta (id_consulta)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_ct_tratamento FOREIGN KEY (id_tratamento)
        REFERENCES tratamento (id_tratamento)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT ck_ct_quantidade CHECK (quantidade > 0),
    CONSTRAINT ck_ct_preco      CHECK (preco_unitario >= 0),
    CONSTRAINT ck_ct_desconto   CHECK (desconto_percentagem BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_ct_tratamento ON consulta_tratamento (id_tratamento);


-- ---------------------------------------------------------------------
-- 11. pagamento — relação 1-1 (opcional) com consulta
-- ---------------------------------------------------------------------
-- Uma consulta tem, no máximo, um pagamento. O que faz disto um 1-1 e
-- não um 1-N é a restrição UNIQUE sobre a chave estrangeira: tire-se o
-- UNIQUE e passa a ser 1-N. Vale a pena mostrar exatamente isso.
--
-- Consultas SEM linha em pagamento = dívida em aberto. É de propósito:
-- só se encontram com LEFT JOIN ... WHERE p.id_pagamento IS NULL,
-- ou com NOT EXISTS. É o exercício natural do módulo das junções.
CREATE TABLE pagamento (
    id_pagamento   MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_consulta    MEDIUMINT UNSIGNED NOT NULL,
    data_pagamento DATE               NOT NULL,
    metodo         ENUM('Numerário','Multibanco','MB WAY','Transferência','Seguro')
                   NOT NULL,
    valor_pago     DECIMAL(8,2)       NOT NULL,
    referencia     VARCHAR(30)            NULL,   -- NULL quando pago em numerário

    CONSTRAINT pk_pagamento    PRIMARY KEY (id_pagamento),
    CONSTRAINT uq_pag_consulta UNIQUE (id_consulta),
    CONSTRAINT fk_pag_consulta FOREIGN KEY (id_consulta)
        REFERENCES consulta (id_consulta)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT ck_pag_valor    CHECK (valor_pago >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ---------------------------------------------------------------------
-- VERIFICAÇÃO RÁPIDA (correr depois de carregar os dados)
-- ---------------------------------------------------------------------
-- SHOW TABLES;
-- SELECT TABLE_NAME, ENGINE, TABLE_COLLATION
--   FROM information_schema.TABLES
--  WHERE TABLE_SCHEMA = 'clinicavet';
-- SHOW CREATE TABLE consulta_tratamento\G
