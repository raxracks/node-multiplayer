const WebSocketServer = require('websocket').server;
const http = require('http');
const player = require('./player.js');
const anticheat = require('./anticheat.js');
const PlayerManager = new player.PlayerManager();
const AntiCheat = new anticheat.AntiCheat(PlayerManager);
const port = 8080;

const server = http.createServer(function (request, response) {
	console.log(`[${new Date()}] Received request for ${request.url}`);
	response.writeHead(404); // could send them to a page instead
	response.end();
});

server.listen(port, function () {
	console.log(`[${new Date()}] Server is listening on port ${port}`);
});

wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false
});

function originIsAllowed(origin) {
	return true;
}

function BroadcastUpdate(id, action, data) {
	let players = PlayerManager.GetPlayers();

	Object.keys(players).forEach(playerID => {
		if(playerID != id) players[playerID].connection.sendUTF(`${new Date()} | ${id} | ${action} | ${JSON.stringify(data)}`);
	});
}

wsServer.on('request', function (request) {
	if (!originIsAllowed(request.origin)) {
		request.reject();
		console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
		return;
	}

	var connection = request.accept('echo-protocol', request.origin);

	console.log((new Date()) + ' Connection accepted.');

	PlayerManager.AddPlayer(request.key, connection);

	connection.on('message', function (message) {
		if (message.type === 'utf8') {
			let split = message.utf8Data.split(" | ");
			let action = split[0];
			let data = JSON.parse(split[1]);

			if(AntiCheat.RequestAction(request.key, action, data) == 1) {
				BroadcastUpdate(request.key, action, data);
			};
		}
		else if (message.type === 'binary') {
			connection.sendBytes(message.binaryData);
		}
	});
	connection.on('close', function (reasonCode, description) {
		console.log(`[${new Date()}] Peer ${connection.remoteAddress} disconnected.`);

		PlayerManager.RemovePlayer(request.key);

		BroadcastUpdate(request.key, "RemovePlayer", {});
	});
});