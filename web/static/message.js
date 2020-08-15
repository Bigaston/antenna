let mess_container = document.getElementById("message_container");
var connection;
let username = localStorage.getItem("username") == null ? "" : localStorage.getItem("username");
let other_username = "";

document.getElementById("username").value = username;

// Génération des clés de chiffrement à partir d'une chaine random
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
    catchCo(conn);
}

// Fonction s'executant quand la connection est effective
function catchCo(conn) {
    connection = conn;

    connection.on('open', function() {
        // Changement d'écran
        document.getElementById("connection_screen").style.display = "none";
        document.getElementById("message_screen").style.display = "block";


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

    connection.on("close", function(args) {
        if (other_username == "") {
            displayLog("L'autre utilisateur s'est déconnecté")
        } else {
            displayLog("<b>" + other_username + "</b> s'est déconnecté")
        }
    })
}

document.getElementById("mess").addEventListener("keypress", (event) => {
    var key = window.event.keyCode;

    if (key === 13) {
        event.preventDefault();
        envoyer();
    }
})

// Fonction pour envoyer un message
function envoyer() {
    let textarea = document.getElementById("mess");

    if (!!textarea.value) {
        if (connection != undefined) {
            let send_obj = {
                type: "message",
                data: other_public_key != undefined ? cryptico.encrypt(textarea.value, other_public_key).cipher : textarea.value,
                encrypted: other_public_key != undefined
            }
    
            send(send_obj);
    
            displayMyMessage(textarea.value);
    
            textarea.value = "";
        }
    }
}

// Si le signal est un message
function parseMessage(content) {
    if (content.encrypted) {
        content.data = cryptico.decrypt(content.data, keys).plaintext;
    }

    displayTheirMessage(content.data);
}

// Récupération d'une clé publique
function parseInit(content) {
    other_public_key = content.public_key;

    if (content.username) {
        other_username = content.username;
        displayLog("Vous êtes connecté avec <b>" + other_username + "</b>");
    } else {
        displayLog("Vous êtes connecté");
    }
}

// En cas de changement des options de l'autre user
function parseOption(content) {
    let current_other_username = other_username;

    if (content.data.option_type == "username") {
        other_username = content.data.value;
        displayLog("<b>" + current_other_username + "</b> est devenu <b>" + other_username + "</b>")
    }
}

function send(send_obj) {
    connection.send(encodeURI(JSON.stringify(send_obj)));
}

function displayLog(text) {
    let p = document.createElement("p");
    p.classList.add("log");
    p.innerHTML = text;

    mess_container.appendChild(p);
    mess_container.scrollTop = mess_container.scrollHeight;
}

function displayMyMessage(text) {
    let name = username != "" ? username : "Moi";

    let p = document.createElement("p");
    p.classList.add("mymess");
    p.innerHTML = "<span class='name'>" + name + ":</span> " + text;

    mess_container.appendChild(p);
    mess_container.scrollTop = mess_container.scrollHeight;
}

function displayTheirMessage(text) {
    let name = other_username != "" ? other_username : "Toi";

    let p = document.createElement("p");
    p.classList.add("theirmess");
    p.innerHTML = "<span class='name'>" + name + ":</span> " + text;

    mess_container.appendChild(p);
    mess_container.scrollTop = mess_container.scrollHeight;
}

// Options
document.getElementById("option_button").addEventListener("click", () => {
    let option_div = document.getElementById("option_screen");

    option_div.style.display = option_div.style.display == "none" ? "block" : "none";
})

function changeUsername() {
    username = document.getElementById("username").value;
    localStorage.setItem("username", username)

    displayLog("Vous êtes maintenant <b>" + username + "</b>")

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