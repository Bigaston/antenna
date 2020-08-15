let mess_container = document.getElementById("message_container");
var connection;

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

        connection.on('data', function(data) {
            console.log(data)

            let content = JSON.parse(decodeURI(data))

            if (content.type == "message") {
                parseMessage(content);
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
            data: textarea.value
        }

        connection.send(encodeURI(JSON.stringify(send_obj)));
        let p = document.createElement("p");
        p.innerHTML = "Moi: " + textarea.value;
        mess_container.appendChild(p)

        textarea.value = "";
    }
}

function parseMessage(content) {
    let p = document.createElement("p");
    p.innerHTML = "Toi: " + content.data;
    mess_container.appendChild(p)
}