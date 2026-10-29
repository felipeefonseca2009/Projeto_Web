const express = require("express");
const path = require("path");
const app = express();
const routes = require("./routes");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/", routes);

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});