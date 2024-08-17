const http = require("http");
const WebSocket = require("ws");

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World\n");
});

server.listen(8081, () => {
    console.log("Server running on http://localhost:8081");
});


// All diferent counters
let counters = {
    counter1: 0,
    counter2: 0,
    counter3: 0,
    counter4: 0,
    counter5: 0,
    counter6: 0
};

// Our web socket server
const wss = new WebSocket.Server({ port: 8080 });

// Fonction pour diffuser un message aux clients dont l'URL correspond à un critère
function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Increment or decrement the counter sent by parameter
function commandCounter(command, counterKey) {
    if (command.localeCompare('increment') == 0) {
        counters[counterKey]++;
    } else if (command.localeCompare('decrement') == 0) {
        counters[counterKey]--;
    }
}

function onWSMessage(message) {
    const msg = message.toString();
    const profile = msg.split(' ')[0];
    const command = msg.split(' ')[1];
    const counterKey = `counter${profile}`;
    console.log(`Message received: ${msg}`);

    switch (profile) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
            commandCounter(command, counterKey);
            broadcast(profile + ' ' + counters[counterKey]);
            break;
        default:
            commandCounter(command, 'counter1');
            broadcast(profile + ' ' + counters['counter1']);
            break;
    }
}

// Send the current counter to the client
function sendCurrentCounter(ws, webPage) {
    switch (webPage) {
        case "profil1":
            ws.send("1 "+ counters['counter1']);
            break;
        case "profil2":
            ws.send("2 "+ counters['counter2']);
            break;
        case "profil3":
            ws.send("3 "+ counters['counter3']);
            break;
        case "profil4":
            ws.send("4 "+ counters['counter4']);
            break;
        case "profil5":
            ws.send("5 "+ counters['counter5']);
            break;
        case "profil6":
            ws.send("6 "+ counters['counter6']);
            break;
        default:
            // For master page
            ws.send("1 "+ counters['counter1']);
            ws.send("2 "+ counters['counter2']);
            ws.send("3 "+ counters['counter3']);
            ws.send("4 "+ counters['counter4']);
            ws.send("5 "+ counters['counter5']);
            ws.send("6 "+ counters['counter6']);
            break;
    }
}

// When a client connects
wss.on("connection", (ws, request) => {
    // Gets the client URL
    const clientUrl = request.url;
    console.log(`Client connected from ${clientUrl}`);

    // Get the page name from the URL
    const webPage = clientUrl.split("/")[clientUrl.length-1];

    sendCurrentCounter(ws, webPage);
    
    // When a message is received
    ws.on("message", onWSMessage);
});