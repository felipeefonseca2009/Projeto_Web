ALTER TABLE clientes
    ADD COLUMN id_usuario INT NULL AFTER id_cliente,
    ADD UNIQUE KEY uq_clientes_id_usuario (id_usuario),
    ADD CONSTRAINT fk_clientes_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);

ALTER TABLE servicos
    ADD COLUMN id_solicitacao INT NULL AFTER id_servico,
    ADD COLUMN descricao_problema TEXT NULL AFTER forma_pagamento,
    ADD UNIQUE KEY uq_servicos_id_solicitacao (id_solicitacao),
    ADD CONSTRAINT fk_servicos_solicitacao
        FOREIGN KEY (id_solicitacao) REFERENCES solicitacoes(id_solicitacao);

ALTER TABLE solicitacoes
    ADD COLUMN marca_veiculo VARCHAR(30) NULL AFTER telefone,
    ADD COLUMN ano_veiculo INT NULL AFTER modelo_veiculo;