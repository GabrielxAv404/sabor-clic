CREATE DATABASE IF NOT EXISTS dark_kitchen
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE dark_kitchen;

CREATE TABLE usuario (
    id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cargo ENUM('cliente', 'cozinha', 'admin')
        NOT NULL DEFAULT 'cliente',
    nome_exibicao VARCHAR(120),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Perfil de Utilizador (E-mail e Telefone)
CREATE TABLE IF NOT EXISTS perfil_usuario (
    id_perfil INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    telefone VARCHAR(30),
    nome_completo VARCHAR(120),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- Tabela de Endereços (Com colunas opcionais NULL para evitar erros no cadastro)
CREATE TABLE IF NOT EXISTS endereco_usuario (
    id_endereco INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    cidade VARCHAR(100) NULL,
    cep VARCHAR(20) NULL,
    bairro VARCHAR(100) NULL,
    rua VARCHAR(150) NULL,
    numero VARCHAR(20) NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE prato (
    id_prato INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    descricao TEXT,
    status ENUM('DISPONIVEL', 'INDISPONIVEL')
        NOT NULL DEFAULT 'DISPONIVEL',
    estoque_disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CHECK (preco >= 0)
);

CREATE TABLE pedido (
    id_pedido INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED,
    nome_usuario VARCHAR(120) NOT NULL,
    nome_comida VARCHAR(255),
    quantidade INT UNSIGNED NOT NULL DEFAULT 0,
    status ENUM('AGUARDANDO', 'EM PREPARO', 'PRONTO', 'ENTREGUE')
        NOT NULL DEFAULT 'AGUARDANDO',
    tempo_estimado_min INT UNSIGNED NOT NULL DEFAULT 30,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    CHECK (total >= 0)
);

CREATE TABLE pedido_item (
    id_pedido_item INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT UNSIGNED NOT NULL,
    id_prato INT UNSIGNED NOT NULL,
    nome_prato_snapshot VARCHAR(120) NOT NULL,
    quantidade INT UNSIGNED NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2)
        GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_prato) REFERENCES prato(id_prato) ON DELETE RESTRICT,
    CHECK (quantidade > 0),
    CHECK (preco_unitario >= 0)
);

CREATE TABLE bancada (
    id_bancada INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    identificacao VARCHAR(100) NOT NULL UNIQUE,
    equipamentos TEXT,
    ativa BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE agendamento_bancada (
    id_agendamento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_bancada INT UNSIGNED NOT NULL,
    id_cozinheiro INT UNSIGNED NOT NULL,
    data_agendamento DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    status ENUM('RESERVADO', 'CANCELADO', 'CONCLUIDO')
        NOT NULL DEFAULT 'RESERVADO',
    FOREIGN KEY (id_bancada) REFERENCES bancada(id_bancada),
    FOREIGN KEY (id_cozinheiro) REFERENCES usuario(id_usuario),
    CHECK (hora_fim > hora_inicio)
);

CREATE TABLE pedido_historico (
    id_historico INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT UNSIGNED NOT NULL,
    status_anterior ENUM('AGUARDANDO', 'EM PREPARO', 'PRONTO', 'ENTREGUE'),
    status_novo ENUM('AGUARDANDO', 'EM PREPARO', 'PRONTO', 'ENTREGUE')
        NOT NULL,
    data_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON DELETE CASCADE
);

USE dark_kitchen;

INSERT INTO usuario
(username, senha_hash, cargo, nome_exibicao)
VALUES
(
    'admin',
    'pbkdf2:sha256:600000$admin_demo_salt$589021d445b27737292da0b76a7a6de3cf14dada1cc6154d6f531340497b4fc1',
    'admin',
    'Administrador'
),
(
    'cozinha01',
    'pbkdf2:sha256:600000$cozinha_demo_salt$d969b0136a6be0934423d4b16707620714bffda1f28a4c9f34e2ff6e5b9c4d0d',
    'cozinha',
    'Equipe da Cozinha'
)
ON DUPLICATE KEY UPDATE
nome_exibicao = VALUES(nome_exibicao);


INSERT INTO prato
(nome, preco, descricao, status, estoque_disponivel)
VALUES
('Barca de Sushi Completa', 29.99, '20 peças variadas de sushi e sashimi frescos, preparados com cortes nobres do chef.', 'DISPONIVEL', TRUE),
('Hot Roll Especial do Chef', 15.00, 'Porção com 8 unidades empanadas e fofas, recheadas com salmão e cream cheese.', 'DISPONIVEL', TRUE),
('Combo Uramakis Diversos', 20.00, '12 unidades variadas de uramaki salmão, skin e filadélfia com gergelim torrado.', 'DISPONIVEL', TRUE),
('Temaki da Vó Sakura', 12.00, 'Temaki grande de salmão batido com cream cheese e cebolinha fresca na alga nori crocante.', 'DISPONIVEL', TRUE),
('Combo Japonês (2 pessoas)', 120.00, 'Combo completo com 32 peças variadas, 2 sunomonos e duas bebidas à escolha.', 'DISPONIVEL', TRUE),
('Combo Japonês (4 pessoas)', 250.00, 'O maior clássico da casa com 64 peças selecionadas, ideal para compartilhar em família.', 'DISPONIVEL', TRUE);


INSERT INTO bancada
(identificacao, equipamentos, ativa)
VALUES
('Bancada A - Sushibar', 'Esteira refrigerada, facas yanagiba, tábuas de polietileno.', TRUE),
('Bancada B - Quentes & Frituras', 'Fritadeiras elétricas duplas, fogão industrial, exaustor.', TRUE),
('Bancada C - Sobremesas & Confeitaria', 'Batedeiras planetárias, geladeira de ultracongelamento.', TRUE);


INSERT INTO pedido
(nome_usuario, nome_comida, quantidade, status, tempo_estimado_min, total)
VALUES
('Felipe Elias', 'Barca de Sushi Completa', 1, 'AGUARDANDO', 0, 29.99),
('Gabriel Santos', 'Hot Roll Especial do Chef', 2, 'EM PREPARO', 20, 30.00);

INSERT INTO perfil_usuario (id_usuario, email, telefone, nome_completo)
VALUES (
    (SELECT id_usuario FROM usuario WHERE username = 'admin' LIMIT 1),
    'admin@sushizen.com',
    '(11) 99999-9999',
    'Administrador do Sistema'
)
ON DUPLICATE KEY UPDATE 
    email = 'admin@sushizen.com';

USE dark_kitchen;

DROP TRIGGER IF EXISTS trg_prato_disponibilidade_bi;
DROP TRIGGER IF EXISTS trg_prato_disponibilidade_bu;
DROP TRIGGER IF EXISTS trg_agendamento_validar_bi;
DROP TRIGGER IF EXISTS trg_agendamento_validar_bu;
DROP TRIGGER IF EXISTS trg_pedido_item_validar_bi;
DROP TRIGGER IF EXISTS trg_pedido_item_validar_bu;
DROP TRIGGER IF EXISTS trg_pedido_historico_ai;
DROP TRIGGER IF EXISTS trg_pedido_historico_au;

DELIMITER $$

CREATE TRIGGER trg_prato_disponibilidade_bi
BEFORE INSERT ON prato
FOR EACH ROW
BEGIN
    IF NEW.estoque_disponivel = FALSE THEN
        SET NEW.status = 'INDISPONIVEL';
    END IF;
END$$

CREATE TRIGGER trg_prato_disponibilidade_bu
BEFORE UPDATE ON prato
FOR EACH ROW
BEGIN
    IF NEW.estoque_disponivel = FALSE THEN
        SET NEW.status = 'INDISPONIVEL';
    END IF;
END$$

CREATE TRIGGER trg_agendamento_validar_bi
BEFORE INSERT ON agendamento_bancada
FOR EACH ROW
BEGIN
    IF NEW.data_agendamento < CURDATE()
       OR (NEW.data_agendamento = CURDATE() AND NEW.hora_inicio <= CURTIME()) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Nao e permitido agendar em data ou horario passado.';
    END IF;

    IF NEW.hora_fim <= NEW.hora_inicio THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A hora final deve ser posterior a hora inicial.';
    END IF;

    IF NEW.status = 'RESERVADO' AND EXISTS (
        SELECT 1
        FROM agendamento_bancada a
        WHERE a.id_bancada = NEW.id_bancada
          AND a.data_agendamento = NEW.data_agendamento
          AND a.status = 'RESERVADO'
          AND NEW.hora_inicio < a.hora_fim
          AND NEW.hora_fim > a.hora_inicio
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A bancada ja possui reserva nesse horario.';
    END IF;
END$$

CREATE TRIGGER trg_agendamento_validar_bu
BEFORE UPDATE ON agendamento_bancada
FOR EACH ROW
BEGIN
    IF NEW.data_agendamento < CURDATE()
       OR (NEW.data_agendamento = CURDATE() AND NEW.hora_inicio <= CURTIME()) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Nao e permitido agendar em data ou horario passado.';
    END IF;

    IF NEW.hora_fim <= NEW.hora_inicio THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A hora final deve ser posterior a hora inicial.';
    END IF;

    IF NEW.status = 'RESERVADO' AND EXISTS (
        SELECT 1
        FROM agendamento_bancada a
        WHERE a.id_bancada = NEW.id_bancada
          AND a.data_agendamento = NEW.data_agendamento
          AND a.status = 'RESERVADO'
          AND a.id_agendamento <> OLD.id_agendamento
          AND NEW.hora_inicio < a.hora_fim
          AND NEW.hora_fim > a.hora_inicio
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A bancada ja possui reserva nesse horario.';
    END IF;
END$$

CREATE TRIGGER trg_pedido_item_validar_bi
BEFORE INSERT ON pedido_item
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);
    DECLARE v_estoque BOOLEAN;

    SELECT status, estoque_disponivel
      INTO v_status, v_estoque
      FROM prato
     WHERE id_prato = NEW.id_prato;

    IF v_status <> 'DISPONIVEL' OR v_estoque = FALSE THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Este prato esta indisponivel.';
    END IF;
END$$

CREATE TRIGGER trg_pedido_item_validar_bu
BEFORE UPDATE ON pedido_item
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);
    DECLARE v_estoque BOOLEAN;

    SELECT status, estoque_disponivel
      INTO v_status, v_estoque
      FROM prato
     WHERE id_prato = NEW.id_prato;

    IF v_status <> 'DISPONIVEL' OR v_estoque = FALSE THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Este prato esta indisponivel.';
    END IF;
END$$

CREATE TRIGGER trg_pedido_historico_ai
AFTER INSERT ON pedido
FOR EACH ROW
BEGIN
    INSERT INTO pedido_historico
    (id_pedido, status_anterior, status_novo)
    VALUES
    (NEW.id_pedido, NULL, NEW.status);
END$$

CREATE TRIGGER trg_pedido_historico_au
AFTER UPDATE ON pedido
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO pedido_historico
        (id_pedido, status_anterior, status_novo)
        VALUES
        (NEW.id_pedido, OLD.status, NEW.status);
    END IF;
END$$

DELIMITER ;

USE dark_kitchen;
SET @inicio = '2026-01-01 00:00:00';
SET @fim    = '2026-12-31 23:59:59';

SELECT
    pi.id_prato,
    pi.nome_prato_snapshot AS prato,
    SUM(pi.quantidade) AS quantidade_vendida,
    SUM(pi.subtotal) AS valor_vendido
FROM pedido_item pi
INNER JOIN pedido p ON p.id_pedido = pi.id_pedido
WHERE p.data_criacao BETWEEN @inicio AND @fim
  AND p.status <> 'AGUARDANDO'
GROUP BY pi.id_prato, pi.nome_prato_snapshot
ORDER BY quantidade_vendida DESC;

SELECT
    DATE(data_criacao) AS dia,
    COUNT(*) AS total_pedidos,
    SUM(total) AS faturamento
FROM pedido
WHERE data_criacao BETWEEN @inicio AND @fim
  AND status IN ('PRONTO', 'ENTREGUE')
GROUP BY DATE(data_criacao)
ORDER BY dia;

SELECT
    b.id_bancada,
    b.identificacao,
    COUNT(a.id_agendamento) AS total_reservas,
    COALESCE(SUM(TIMESTAMPDIFF(MINUTE, a.hora_inicio, a.hora_fim)), 0)
        AS minutos_reservados,
    ROUND(
        COALESCE(SUM(TIMESTAMPDIFF(MINUTE, a.hora_inicio, a.hora_fim)), 0)
        / (480 * GREATEST(DATEDIFF(DATE(@fim), DATE(@inicio)) + 1, 1))
        * 100,
        2
    ) AS ocupacao_percentual
FROM bancada b
LEFT JOIN agendamento_bancada a
    ON a.id_bancada = b.id_bancada
   AND a.status = 'RESERVADO'
   AND a.data_agendamento BETWEEN DATE(@inicio) AND DATE(@fim)
GROUP BY b.id_bancada, b.identificacao
ORDER BY ocupacao_percentual DESC;

SELECT
    HOUR(hora_inicio) AS hora,
    COUNT(*) AS quantidade_reservas
FROM agendamento_bancada
WHERE data_agendamento BETWEEN DATE(@inicio) AND DATE(@fim)
  AND status = 'RESERVADO'
GROUP BY HOUR(hora_inicio)
ORDER BY quantidade_reservas DESC;

SELECT
    u.id_usuario,
    u.nome_exibicao AS cozinheiro,
    COUNT(a.id_agendamento) AS total_reservas
FROM usuario u
LEFT JOIN agendamento_bancada a
    ON a.id_cozinheiro = u.id_usuario
   AND a.status = 'RESERVADO'
   AND a.data_agendamento BETWEEN DATE(@inicio) AND DATE(@fim)
WHERE u.cargo = 'cozinha'
GROUP BY u.id_usuario, u.nome_exibicao
ORDER BY total_reservas DESC;

SET @id_pedido = 1;
SELECT
    id_historico,
    id_pedido,
    status_anterior,
    status_novo,
    data_evento
FROM pedido_historico
WHERE id_pedido = @id_pedido
ORDER BY data_evento;
