async function testarConexao() {
    let db;

    try {
        db = require("./db");
        const [resultado] = await db.query(
            "SELECT 1 AS conectado"
        );

        console.log(resultado);
        console.log("Conectado ao MySQL com sucesso!");

    } catch (erro) {
        console.error("Erro na conexão:");
        console.error(erro.message);
        process.exitCode = 1;
    } finally {
        if (db) {
            await db.end();
        }
    }
}

testarConexao();