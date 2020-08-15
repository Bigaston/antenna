require("dotenv").config()

const express = require("express")
const path = require("path")
const fs = require("fs")

var app = express();

app.get("/static/*", (req, res) => {
	file_url = req.path.replace("/static/", "")

	if (fs.existsSync("./static/" + file_url)) {
		res.sendFile(path.join(__dirname, "./static/" + file_url))
	} else {
		res.status(404).send("Not Found")
	}
});

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/page/index.html"))
})

app.listen(process.env.PORT, () => console.log(`Serveur lancé sur le port ${process.env.PORT}`))