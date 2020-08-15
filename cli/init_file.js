const fs = require("fs")
const path = require("path")

console.log("Création des fichiers de base")

if (!fs.existsSync(path.join(__dirname, "../.env"))) {
    fs.writeFileSync(path.join(__dirname, "../.env"), `
PORT=4937
NODE_ENV=dev
`)
}

console.log("L'instalation est terminée.")
console.log("Pensez aussi à éditer vos informations dans .env")