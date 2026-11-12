USE defaultdb;
-- ========================================================
-- CADASTROS BASE E ACESSO
-- ========================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('ADM', 'VENDEDOR', 'MECANICO') NOT NULL
);

CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    cpf VARCHAR(14) UNIQUE,
    cnpj VARCHAR(18) UNIQUE,    
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS veiculos (
    id_veiculo INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    placa VARCHAR(8) NOT NULL UNIQUE,
    marca VARCHAR(30) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    ano INT NOT NULL,
    observacoes TEXT,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);

CREATE TABLE IF NOT EXISTS mecanicos (
    id_mecanico INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    especialidade VARCHAR(50)
);

-- ========================================================
-- MOVIMENTAÇÕES E TRANSAÇÕES
-- ========================================================

CREATE TABLE IF NOT EXISTS servicos (
    id_servico INT AUTO_INCREMENT PRIMARY KEY,
    id_mecanico INT NOT NULL,
    id_cliente INT NOT NULL,
    id_veiculo INT NOT NULL,
    data_servico DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    preco_servico DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_mecanico) REFERENCES mecanicos(id_mecanico),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_veiculo) REFERENCES veiculos(id_veiculo)
);

CREATE TABLE IF NOT EXISTS solicitacoes (
    id_solicitacao INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    modelo_veiculo VARCHAR(50) NOT NULL,
    placa VARCHAR(8) NOT NULL,
    descricao_problema TEXT NOT NULL,
    status ENUM('PENDENTE', 'EM_ATENDIMENTO', 'CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    data_solicitacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);