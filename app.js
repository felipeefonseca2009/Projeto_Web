const express = require("express");
const path = require("path");
const cookieSession = require("cookie-session");
require("dotenv").config();

const app = express();
const routes = require("./routes");
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error("Configure SESSION_SECRET com pelo menos 32 caracteres.");
}

app.set("view engine", "ejs");
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieSession({
    name: "vrum_admin",
    keys: [sessionSecret],
    maxAge: 8 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
}));
app.use("/", routes);

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});