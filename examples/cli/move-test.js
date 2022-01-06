var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
    
    function keepAlive() {
        if (connection.connected) {
            connection.sendBytes(Buffer.alloc(0));
        }
    }

    setInterval(keepAlive, 1000);

    let data = {pos: {x: 1, y: 1}};

    setInterval(() => {
        data = {pos: {x: 1, y: 1, z: 1}};
        connection.sendUTF(`Move | ${JSON.stringify(data)}`);
        setTimeout(() => {
            data = {pos: {x: 2, y: 2, z: 2}};
            connection.sendUTF(`Move | ${JSON.stringify(data)}`);
        }, 1000);
    }, 2000);
});

client.connect('ws://localhost:8080/', 'echo-protocol');