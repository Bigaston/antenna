require("dotenv").config()

const express = require("express")
const { ExpressPeerServer } = require('peer');
const path = require("path")
const fs = require("fs")

var app = express();

app.get("/static/*", (req, res) => {
	file_url = req.path.replace("/static/", "")

	if (fs.existsSync("./web/static/" + file_url)) {
		res.sendFile(path.join(__dirname, "./web/static/" + file_url))
	} else {
		res.status(404).send("Not Found")
	}
});

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/web/index.html"))
})

const serv = app.listen(process.env.PORT, () => console.log(`Serveur lancé sur le port ${process.env.PORT}`));

// Launch Peer Server
const customGenerationFunction = () => {
    let id = "";

    for (i = 0; i < 3; i++) {
        id = id + Math.round(Math.random()*9);
    }

    id = id + "-";

    for (i = 0; i < 3; i++) {
        id = id + Math.round(Math.random()*9);
    }

    id = id + "-";

    for (i = 0; i < 3; i++) {
        id = id + Math.round(Math.random()*9);
    }

    return id;
};

let conf = {
    path: '/antenna',
    generateClientId: customGenerationFunction
}

if (process.env.NODE_ENV == "prod") {
    conf.proxied = true;
    conf.ssl = {
        key: fs.readFileSync(process.env.PATH_KEY),
        cert: fs.readFileSync(process.env.PATH_CERT)
    }
}

const peerServer = ExpressPeerServer(serv, conf);

app.use('/peerjs', peerServer);