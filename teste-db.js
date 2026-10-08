require("dotenv").config();

const mysql = require("mysql2/promise");

async function testarConexao() {

    try {

        const conexao = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,

            ssl: {
                rejectUnauthorized: false
            }
        });

        const [resultado] = await conexao.query(
            "SELECT 1 AS conectado"
        );

        console.log(resultado);

        await conexao.end();

        console.log("Conectado ao MySQL/Aiven com sucesso!");

    } catch (erro) {

        console.error("Erro na conexão:");
        console.error(erro.message);

    }
}

testarConexao();