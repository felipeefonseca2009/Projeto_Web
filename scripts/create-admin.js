require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("../db");

async function criarAdministrador() {
    const nome = (process.env.ADMIN_NAME || "").trim();
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const senha = process.env.ADMIN_PASSWORD || "";

    if (
        !nome || nome.length > 100 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100 ||
        Buffer.byteLength(senha, "utf8") < 12 || Buffer.byteLength(senha, "utf8") > 72
    ) {
        throw new Error("Defina ADMIN_NAME, ADMIN_EMAIL e uma ADMIN_PASSWORD de 12 a 72 bytes.");
    }

    const [administradores] = await db.execute(
        "SELECT id_usuario FROM usuarios WHERE tipo = 'ADM' LIMIT 1"
    );

    if (administradores.length > 0) {
        throw new Error("Já existe um administrador. O bootstrap inicial foi bloqueado.");
    }

    const senhaHash = await bcrypt.hash(senha, 12);
    await db.execute(
        "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, 'ADM')",
        [nome, email, senhaHash]
    );

    console.log("Administrador criado. Remova ADMIN_PASSWORD do ambiente após o bootstrap.");
}

criarAdministrador()
    .catch((erro) => {
        console.error(erro.message);
        process.exitCode = 1;
    })
    .finally(() => db.end());