let mess_container = document.getElementById("message_container");
var connection;
let username = "";
let other_username = "";

let keys = cryptico.generateRSAKey((Math.random().toString(36) + '0000000000000000000').substr(2, 16), 512);
let other_public_key;

// Création de l'instance de Peer
var peer = new Peer(undefined, {
    host: "/",
    port: 4937,
    path: "/peerjs/antenna"
});

// Autentification auprès du serveur et récupération de l'ID
peer.on('open', function(id) {
    document.getElementById("disp_id").innerHTML = id;
});

// Si on essaye de se connecter à moi
peer.on('connection', catchCo);

// Pour essayer de se connecter à quelqu'un
function connect() {
    let other_id = document.getElementById("code_input").value;

    var conn = peer.connect(other_id);
    catchCo(conn)
}

// Fonction s'executant quand la connection est effective
function catchCo(conn) {
    connection = conn;

    connection.on('open', function() {
        let p = document.createElement("p");
        p.innerHTML = "Connecté";
        mess_container.appendChild(p)

        // Envoit de la clé publique
        let send_obj = {
            type: "init",
            public_key: cryptico.publicKeyString(keys),
            username: username != "" ? username : undefined
        }

        send(send_obj);

        connection.on('data', function(data) {
            let content = JSON.parse(decodeURI(data))

            if (content.type == "message") {
                parseMessage(content);
            } else if (content.type == "init") {
                parseInit(content);
            } else if (content.type == "option") {
                parseOption(content);
            }
        });
    });
}

// Fonction pour envoyer un message
function envoyer() {
    let textarea = document.getElementById("mess");

    if (connection != undefined) {
        let send_obj = {
            type: "message",
            data: other_public_key != undefined ? cryptico.encrypt(textarea.value, other_public_key).cipher : textarea.value,
            encrypted: other_public_key != undefined
        }

        send(send_obj);

        let p = document.createElement("p");
        p.innerHTML = myName() + ": " + textarea.value;
        mess_container.appendChild(p)

        textarea.value = "";
    }
}

// Si le signal est un message
function parseMessage(content) {
    if (content.encrypted) {
        content.data = cryptico.decrypt(content.data, keys).plaintext;
    }

    let p = document.createElement("p");
    p.innerHTML = otherName() + ": " + content.data;
    mess_container.appendChild(p)
}

// Récupération d'une clé publique
function parseInit(content) {
    other_public_key = content.public_key;

    if (content.username) {
        other_username = content.username;
    }
}

// En cas de changement des options de l'autre user
function parseOption(content) {
    if (content.data.option_type == "username") {
        other_username = content.data.value;
    }
}

function changeUsername() {
    username = document.getElementById("username").value;

    if (connection != undefined) {
        let send_obj = {
            type: "option",
            data: {
                option_type: "username",
                value: username
            }
        }

        send(send_obj);
    }
}

function send(send_obj) {
    connection.send(encodeURI(JSON.stringify(send_obj)));
}

function otherName() {
    return other_username != "" ? other_username : "Toi";
}

function myName() {
    return username != "" ? username : "Moi";
}