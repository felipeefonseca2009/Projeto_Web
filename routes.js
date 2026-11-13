const express = require("express");
const router = express.Router();
const db = require("./db");
const bcrypt = require("bcryptjs");

function requireAdmin(req, res, next) {
    if (req.session?.user?.tipo !== "ADM") {
        return res.redirect("/admin/login");
    }

    return next();
}

function requireCustomer(req, res, next) {
    if (req.session?.user?.tipo !== "CLIENTE") {
        return res.redirect("/login?necessario=1");
    }

    return next();
}

function limpar(valor) {
    return typeof valor === "string" ? valor.trim() : "";
}

function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 100;
}

function senhaValida(senha) {
    const bytes = Buffer.byteLength(senha, "utf8");
    return bytes >= 12 && bytes <= 72;
}

// PÁGINA PRINCIPAL

router.get("/", (req, res) => {
    res.render("principal");
});

// CONTAS DE CLIENTES

router.get("/cadastro", (req, res) => {
    if (req.session?.user?.tipo === "CLIENTE") {
        return res.redirect("/servicos");
    }

    return res.render("cadastro", { erro: false });
});

router.post("/cadastro", async (req, res) => {
    const nome = limpar(req.body.nome);
    const email = limpar(req.body.email).toLowerCase();
    const senha = typeof req.body.senha === "string" ? req.body.senha : "";

    if (!nome || nome.length > 100 || !emailValido(email) || !senhaValida(senha)) {
        return res.status(400).render("cadastro", { erro: true });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 12);
        const [resultado] = await db.execute(
            "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, 'CLIENTE')",
            [nome, email, senhaHash]
        );

        req.session = {
            user: {
                id: resultado.insertId,
                tipo: "CLIENTE",
                nome
            }
        };

        return res.redirect("/servicos");
    } catch (erro) {
        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).render("cadastro", { erro: true });
        }

        console.error("Erro ao cadastrar cliente:", erro.message);
        return res.status(500).render("cadastro", { erro: true });
    }
});

router.get("/login", (req, res) => {
    if (req.session?.user?.tipo === "CLIENTE") {
        return res.redirect("/servicos");
    }

    return res.render("login", {
        erro: req.query.erro === "1",
        necessario: req.query.necessario === "1"
    });
});

router.post("/login", async (req, res) => {
    const email = limpar(req.body.email).toLowerCase();
    const senha = typeof req.body.senha === "string" ? req.body.senha : "";

    if (!emailValido(email) || !senhaValida(senha)) {
        return res.redirect("/login?erro=1");
    }

    try {
        const [usuarios] = await db.execute(
            "SELECT id_usuario, nome, senha, tipo FROM usuarios WHERE email = ? LIMIT 1",
            [email]
        );
        const usuario = usuarios[0];

        if (!usuario || usuario.tipo !== "CLIENTE" || !(await bcrypt.compare(senha, usuario.senha))) {
            return res.redirect("/login?erro=1");
        }

        req.session = {
            user: {
                id: usuario.id_usuario,
                tipo: usuario.tipo,
                nome: usuario.nome
            }
        };

        return res.redirect("/servicos");
    } catch (erro) {
        console.error("Erro ao autenticar cliente:", erro.message);
        return res.status(500).render("login", { erro: true, necessario: false });
    }
});

router.post("/logout", requireCustomer, (req, res) => {
    req.session = null;
    res.redirect("/login");
});

// PÁGINA DE SERVIÇOS

router.get("/servicos", requireCustomer, (req, res) => {
    res.render("servicos", {
        enviado: req.query.enviado === "1",
        erro: req.query.erro === "1"
    });
});

router.post("/servicos", requireCustomer, async (req, res) => {

    const nome = limpar(req.body.nome);
    const telefone = limpar(req.body.telefone);
    const marca = limpar(req.body.marca);
    const modelo = limpar(req.body.modelo);
    const ano = Number(req.body.ano);
    const placa = limpar(req.body.placa).toUpperCase();
    const problema = limpar(req.body.problema);
    const anoAtual = new Date().getFullYear();

    if (
        !nome || !telefone || !marca || !modelo || !placa || !problema ||
        nome.length > 100 || telefone.length > 20 ||
        marca.length > 30 || modelo.length > 50 ||
        !Number.isInteger(ano) || ano < 1900 || ano > anoAtual + 1 ||
        placa.length > 8 || problema.length > 5000
    ) {
        return res.status(400).render("servicos", {
            enviado: false,
            erro: true
        });
    }

    try {
        await db.execute(
            `INSERT INTO solicitacoes (
                id_usuario, nome, telefone, marca_veiculo, modelo_veiculo,
                ano_veiculo, placa, descricao_problema
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.session.user.id, nome, telefone, marca, modelo, ano, placa, problema]
        );

        return res.redirect(303, "/servicos?enviado=1");
    } catch (erro) {
        console.error("Erro ao salvar solicitação:", erro);

        return res.status(500).render("servicos", {
            enviado: false,
            erro: true
        });
    }
});

// ACESSO ADMINISTRATIVO

router.get("/admin/cadastro", (req, res) => {
    if (req.session?.user?.tipo === "ADM") {
        return res.redirect("/admin");
    }

    return res.render("admin-cadastro", { erro: false });
});

router.post("/admin/cadastro", async (req, res) => {
    const nome = limpar(req.body.nome);
    const email = limpar(req.body.email).toLowerCase();
    const senha = typeof req.body.senha === "string" ? req.body.senha : "";

    if (!nome || nome.length > 100 || !emailValido(email) || !senhaValida(senha)) {
        return res.status(400).render("admin-cadastro", { erro: true });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 12);
        const [resultado] = await db.execute(
            "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, 'ADM')",
            [nome, email, senhaHash]
        );

        req.session = {
            user: {
                id: resultado.insertId,
                tipo: "ADM",
                nome
            }
        };

        return res.redirect("/admin");
    } catch (erro) {
        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).render("admin-cadastro", { erro: true });
        }

        console.error("Erro ao cadastrar administrador:", erro.message);
        return res.status(500).render("admin-cadastro", { erro: true });
    }
});

router.get("/admin/login", (req, res) => {
    if (req.session?.user?.tipo === "ADM") {
        return res.redirect("/admin");
    }

    return res.render("admin-login", { erro: req.query.erro === "1" });
});

router.post("/admin/login", async (req, res) => {
    const email = limpar(req.body.email).toLowerCase();
    const senha = typeof req.body.senha === "string" ? req.body.senha : "";

    try {
        const [usuarios] = await db.execute(
            "SELECT id_usuario, nome, senha, tipo FROM usuarios WHERE email = ? LIMIT 1",
            [email]
        );
        const usuario = usuarios[0];

        if (!usuario || usuario.tipo !== "ADM" || !(await bcrypt.compare(senha, usuario.senha))) {
            return res.redirect("/admin/login?erro=1");
        }

        req.session = {
            user: {
                id: usuario.id_usuario,
                tipo: usuario.tipo,
                nome: usuario.nome
            }
        };

        return res.redirect("/admin");
    } catch (erro) {
        console.error("Erro ao autenticar administrador:", erro.message);
        return res.status(500).render("admin-login", { erro: true });
    }
});

router.post("/admin/logout", requireAdmin, (req, res) => {
    req.session = null;
    res.redirect("/admin/login");
});

router.get("/admin", requireAdmin, async (req, res) => {
    try {
        const [solicitacoes] = await db.query(`
            SELECT s.id_solicitacao, s.id_usuario, s.nome, s.telefone,
                     s.marca_veiculo, s.modelo_veiculo, s.ano_veiculo,
                     s.placa, s.descricao_problema,
                   s.status, s.data_solicitacao, u.email AS email_cliente
            FROM solicitacoes s
            LEFT JOIN usuarios u ON u.id_usuario = s.id_usuario
            WHERE s.status = 'PENDENTE'
            ORDER BY s.data_solicitacao ASC
            LIMIT 50
        `);
        const [solicitacoesHistorico] = await db.query(`
                 SELECT id_solicitacao, nome, marca_veiculo, modelo_veiculo,
                     ano_veiculo, placa,
                   descricao_problema, status, data_solicitacao
            FROM solicitacoes
            WHERE status <> 'PENDENTE'
            ORDER BY data_solicitacao DESC
            LIMIT 50
        `);
        const [mecanicos] = await db.query(`
            SELECT id_mecanico, nome, especialidade
            FROM mecanicos
            ORDER BY nome
        `);
        const [clientes] = await db.query(`
            SELECT id_cliente, nome, telefone, email
            FROM clientes
            ORDER BY id_cliente DESC
            LIMIT 20
        `);
        const [veiculos] = await db.query(`
            SELECT v.id_veiculo, v.placa, v.marca, v.modelo, v.ano, c.nome AS cliente
            FROM veiculos v
            INNER JOIN clientes c ON c.id_cliente = v.id_cliente
            ORDER BY v.id_veiculo DESC
            LIMIT 20
        `);
        const [servicos] = await db.query(`
                        SELECT s.id_servico, s.data_servico, s.preco_servico,
                                     s.forma_pagamento, s.descricao_problema,
                   c.nome AS cliente, v.placa, v.modelo, m.nome AS mecanico
            FROM servicos s
            INNER JOIN clientes c ON c.id_cliente = s.id_cliente
            INNER JOIN veiculos v ON v.id_veiculo = s.id_veiculo
            INNER JOIN mecanicos m ON m.id_mecanico = s.id_mecanico
            ORDER BY s.data_servico DESC
            LIMIT 20
        `);
        const [resumos] = await db.query(`
            SELECT
                (SELECT COUNT(*) FROM solicitacoes WHERE status = 'PENDENTE') AS pendentes,
                (SELECT COUNT(*) FROM clientes) AS clientes,
                (SELECT COUNT(*) FROM veiculos) AS veiculos,
                (SELECT COUNT(*) FROM servicos) AS servicos
        `);

        const mensagens = {
            processamento: "Não foi possível processar a solicitação. Confira os dados e tente novamente.",
            mecanico: "Não foi possível cadastrar o mecânico. Confira os campos.",
            dados: "Preencha corretamente os dados necessários para abrir o serviço.",
            sucesso: "Solicitação processada e serviço criado.",
            concluida: "Solicitação marcada como concluída.",
            concluir: "Não foi possível concluir. Verifique se a solicitação está em atendimento.",
            mecanicoCriado: "Mecânico cadastrado com sucesso."
        };

        return res.render("admin", {
            solicitacoes,
            solicitacoesHistorico,
            mecanicos,
            clientes,
            veiculos,
            servicos,
            resumo: resumos[0],
            mensagem: mensagens[req.query.aviso] || "",
            erro: Boolean(mensagens[req.query.erro])
        });
    } catch (erro) {
        console.error("Erro ao carregar painel administrativo:", erro.message);
        return res.status(500).send("Não foi possível carregar o painel administrativo.");
    }
});

router.post("/admin/solicitacoes/:id/concluir", requireAdmin, async (req, res) => {
    const solicitacaoId = Number(req.params.id);

    if (!Number.isInteger(solicitacaoId) || solicitacaoId < 1) {
        return res.redirect("/admin?erro=concluir");
    }

    try {
        const [resultado] = await db.execute(
            "UPDATE solicitacoes SET status = 'CONCLUIDA' WHERE id_solicitacao = ? AND status = 'EM_ATENDIMENTO'",
            [solicitacaoId]
        );

        if (resultado.affectedRows !== 1) {
            return res.redirect("/admin?erro=concluir");
        }

        return res.redirect("/admin?aviso=concluida");
    } catch (erro) {
        console.error("Erro ao concluir solicitação:", erro.message);
        return res.redirect("/admin?erro=concluir");
    }
});

router.post("/admin/mecanicos", requireAdmin, async (req, res) => {
    const nome = limpar(req.body.nome);
    const telefone = limpar(req.body.telefone);
    const email = limpar(req.body.email).toLowerCase();
    const especialidade = limpar(req.body.especialidade);

    if (
        !nome || !telefone || !email || nome.length > 100 ||
        telefone.length > 20 || email.length > 100 || especialidade.length > 50
    ) {
        return res.redirect("/admin?erro=mecanico");
    }

    try {
        await db.execute(
            "INSERT INTO mecanicos (nome, telefone, email, especialidade) VALUES (?, ?, ?, ?)",
            [nome, telefone, email, especialidade || null]
        );
        return res.redirect("/admin?aviso=mecanicoCriado");
    } catch (erro) {
        console.error("Erro ao cadastrar mecânico:", erro.message);
        return res.redirect("/admin?erro=mecanico");
    }
});

router.post("/admin/solicitacoes/:id/processar", requireAdmin, async (req, res) => {
    const solicitacaoId = Number(req.params.id);
    const emailInformado = limpar(req.body.email).toLowerCase();
    const marca = limpar(req.body.marca);
    const modelo = limpar(req.body.modelo);
    const ano = Number(req.body.ano);
    const idMecanico = Number(req.body.id_mecanico);
    const preco = limpar(req.body.preco_servico).replace(",", ".");
    const formaPagamento = limpar(req.body.forma_pagamento);
    const anoAtual = new Date().getFullYear();

    if (
        !Number.isInteger(solicitacaoId) || solicitacaoId < 1 ||
        !marca || marca.length > 30 || !modelo || modelo.length > 50 ||
        !Number.isInteger(ano) || ano < 1900 || ano > anoAtual + 1 ||
        !Number.isInteger(idMecanico) || idMecanico < 1 ||
        !/^\d{1,8}(?:\.\d{1,2})?$/.test(preco) ||
        !formaPagamento || formaPagamento.length > 50
    ) {
        return res.redirect("/admin?erro=dados");
    }

    let conexao;

    try {
        conexao = await db.getConnection();
        await conexao.beginTransaction();

        const [solicitacoes] = await conexao.execute(
            `SELECT id_solicitacao, id_usuario, nome, telefone,
                    modelo_veiculo, placa, descricao_problema
             FROM solicitacoes
             WHERE id_solicitacao = ? AND status = 'PENDENTE'
             FOR UPDATE`,
            [solicitacaoId]
        );
        const solicitacao = solicitacoes[0];

        if (!solicitacao) {
            throw new Error("Solicitação inexistente ou já processada.");
        }

        let idUsuario = solicitacao.id_usuario;
        let emailCliente = emailInformado;

        if (idUsuario) {
            const [usuarios] = await conexao.execute(
                "SELECT id_usuario, email FROM usuarios WHERE id_usuario = ? AND tipo = 'CLIENTE' FOR UPDATE",
                [idUsuario]
            );

            if (!usuarios[0]) {
                throw new Error("A conta vinculada à solicitação não foi encontrada.");
            }

            emailCliente = usuarios[0].email;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCliente) || emailCliente.length > 100) {
            throw new Error("Informe um e-mail válido para a solicitação antiga.");
        }

        const [mecanicosEncontrados] = await conexao.execute(
            "SELECT id_mecanico FROM mecanicos WHERE id_mecanico = ? FOR UPDATE",
            [idMecanico]
        );

        if (!mecanicosEncontrados[0]) {
            throw new Error("Mecânico não encontrado.");
        }

        let clientesEncontrados = [];

        if (idUsuario) {
            [clientesEncontrados] = await conexao.execute(
                "SELECT id_cliente, id_usuario FROM clientes WHERE id_usuario = ? FOR UPDATE",
                [idUsuario]
            );
        }

        if (!clientesEncontrados[0]) {
            [clientesEncontrados] = await conexao.execute(
                "SELECT id_cliente, id_usuario FROM clientes WHERE LOWER(email) = ? ORDER BY id_cliente LIMIT 1 FOR UPDATE",
                [emailCliente]
            );
        }
        let idCliente;

        if (clientesEncontrados[0]) {
            if (clientesEncontrados[0].id_usuario && clientesEncontrados[0].id_usuario !== idUsuario) {
                throw new Error("O e-mail já está vinculado a outra conta de cliente.");
            }
            idCliente = clientesEncontrados[0].id_cliente;
            if (idUsuario && !clientesEncontrados[0].id_usuario) {
                await conexao.execute(
                    "UPDATE clientes SET id_usuario = ? WHERE id_cliente = ?",
                    [idUsuario, idCliente]
                );
            }
        } else {
            const [novoCliente] = await conexao.execute(
                "INSERT INTO clientes (id_usuario, nome, telefone, email) VALUES (?, ?, ?, ?)",
                [idUsuario, solicitacao.nome, solicitacao.telefone, emailCliente]
            );
            idCliente = novoCliente.insertId;
        }

        const [veiculosEncontrados] = await conexao.execute(
            "SELECT id_veiculo, id_cliente FROM veiculos WHERE placa = ? FOR UPDATE",
            [solicitacao.placa]
        );
        let idVeiculo;

        if (veiculosEncontrados[0]) {
            if (veiculosEncontrados[0].id_cliente !== idCliente) {
                throw new Error("A placa já está cadastrada para outro cliente.");
            }
            idVeiculo = veiculosEncontrados[0].id_veiculo;
            await conexao.execute(
                "UPDATE veiculos SET marca = ?, modelo = ?, ano = ? WHERE id_veiculo = ?",
                [marca, modelo, ano, idVeiculo]
            );
        } else {
            const [novoVeiculo] = await conexao.execute(
                `INSERT INTO veiculos (id_cliente, placa, marca, modelo, ano)
                 VALUES (?, ?, ?, ?, ?)`,
                [idCliente, solicitacao.placa, marca, modelo, ano]
            );
            idVeiculo = novoVeiculo.insertId;
        }

        await conexao.execute(
            `INSERT INTO servicos (
                id_solicitacao, id_mecanico, id_cliente, id_veiculo,
                preco_servico, forma_pagamento, descricao_problema
             ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [solicitacaoId, idMecanico, idCliente, idVeiculo, preco, formaPagamento, solicitacao.descricao_problema]
        );
        await conexao.execute(
            "UPDATE solicitacoes SET status = 'EM_ATENDIMENTO' WHERE id_solicitacao = ?",
            [solicitacaoId]
        );
        await conexao.commit();

        return res.redirect("/admin?aviso=sucesso");
    } catch (erro) {
        if (conexao) {
            await conexao.rollback();
        }
        console.error("Erro ao processar solicitação:", erro.message);
        return res.redirect("/admin?erro=processamento");
    } finally {
        if (conexao) {
            conexao.release();
        }
    }
});

// TESTE DE CONEXÃO COM O MYSQL

router.get("/teste-db", async (req, res) => {

    try {

        const [resultado] = await db.query(
            "SELECT 1 AS conectado"
        );

        res.json(resultado);

    } catch (erro) {

        console.error("Erro no banco:", erro);

        res.status(500).json({ erro: "Erro ao consultar o banco" });

    }

});

// LISTAR CLIENTES

router.get("/clientes", requireAdmin, async (req, res) => {

    try {

        const [clientes] = await db.query(`
            SELECT
                id_cliente,
                nome,
                telefone,
                email
            FROM clientes
            ORDER BY nome
        `);

        res.json(clientes);

    } catch (erro) {

        console.error("Erro ao consultar clientes:", erro);

        res.status(500).json({
            erro: "Erro ao consultar clientes"
        });
    }
});


module.exports = router;