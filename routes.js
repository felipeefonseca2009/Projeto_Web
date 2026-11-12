const express = require("express");
const router = express.Router();
const db = require("./db");

// PÁGINA PRINCIPAL

router.get("/", (req, res) => {
    res.render("principal");
});

// PÁGINA DE SERVIÇOS

router.get("/servicos", (req, res) => {
    res.render("servicos", { enviado: false });
});

router.post("/servicos", async (req, res) => {
    const { nome, telefone, email } = req.body;

    if (!nome || !telefone || !email) {
        return res.status(400).render("servicos", { enviado: false });
    }

    try {
        await db.query(
            "INSERT INTO clientes (nome, telefone, email) VALUES (?, ?, ?)",
            [nome, telefone, email]
        );
        res.render("servicos", { enviado: true });
    } catch (erro) {
        console.error("Erro ao salvar cliente:", erro);
        res.status(500).send("Erro ao salvar os dados");
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

router.get("/clientes", async (req, res) => {

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