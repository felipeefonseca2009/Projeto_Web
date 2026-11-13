ALTER TABLE usuarios
    MODIFY COLUMN tipo ENUM('ADM', 'VENDEDOR', 'MECANICO', 'CLIENTE') NOT NULL;

ALTER TABLE solicitacoes
    ADD COLUMN id_usuario INT NULL AFTER id_solicitacao,
    ADD CONSTRAINT fk_solicitacoes_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);
