let mess_container = document.getElementById("message_container");
var connection;

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

        let send_obj = {
            type: "public_key",
            data: cryptico.publicKeyString(keys)
        }

        connection.send(encodeURI(JSON.stringify(send_obj)));

        connection.on('data', function(data) {
            let content = JSON.parse(decodeURI(data))

            if (content.type == "message") {
                parseMessage(content);
            } else if (content.type == "public_key") {
                parseKey(content);
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

        connection.send(encodeURI(JSON.stringify(send_obj)));
        let p = document.createElement("p");
        p.innerHTML = "Moi: " + textarea.value;
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
    p.innerHTML = "Toi: " + content.data;
    mess_container.appendChild(p)
}

// Récupération d'une clé publique
function parseKey(content) {
    other_public_key = content.data;
}