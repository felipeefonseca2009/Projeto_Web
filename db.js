require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");

const requiredVariables = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
    throw new Error(`Variáveis de banco ausentes: ${missingVariables.join(", ")}`);
}

const port = Number(process.env.DB_PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("DB_PORT deve ser uma porta válida entre 1 e 65535.");
}

const ssl = process.env.DB_SSL_CA_PATH
    ? {
        ca: fs.readFileSync(path.resolve(__dirname, process.env.DB_SSL_CA_PATH)),
        rejectUnauthorized: true
    }
    : { rejectUnauthorized: false };

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;