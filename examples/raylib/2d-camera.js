const r = require('raylib');
const WebSocketClient = require('websocket').client;
const client = new WebSocketClient();
const players = {};
const packetDelay = 1; // in milliseconds
let packet = {};
let previousPacket = packet;
let currentConnection = undefined;

const MAX_BUILDINGS = 100

// Initialization
//--------------------------------------------------------------------------------------
const screenWidth = 800
const screenHeight = 450

r.InitWindow(screenWidth, screenHeight, "2d multiplayer")

const player = r.Rectangle(400, 280, 40, 40)
const buildings = []
const buildColors = []

let spacing = 0;

for (let i = 0; i < MAX_BUILDINGS; i++) {
    let height = r.GetRandomValue(100, 800)
    let newBuilding = r.Rectangle(
        -6000 + spacing,
        screenHeight - 130 - height,
        r.GetRandomValue(50, 200),
        height
    )
    spacing += newBuilding.width;
    buildings.push(newBuilding)
    buildColors.push(r.Color(r.GetRandomValue(200, 240), r.GetRandomValue(200, 240), r.GetRandomValue(200, 250), 255))
}

const camera = r.Camera2D(
    r.Vector2(),
    r.Vector2(player.x + 20, player.y + 20),
    0, 1)

r.SetTargetFPS(60);                   // Set our game to run at 60 frames-per-second
//--------------------------------------------------------------------------------------

// Main game loop
let interval = setInterval(() => {
    // Update
    //----------------------------------------------------------------------------------
    if (r.IsKeyDown(r.KEY_RIGHT)) {
        player.x += 2;              // Player movement
    }
    else if (r.IsKeyDown(r.KEY_LEFT)) {
        player.x -= 2;              // Player movement
    }

    packet = `Move | ${JSON.stringify({x: player.x})}`;

    // Camera target follows player
    camera.target = r.Vector2(player.x - (screenWidth / 2) + 20, player.y - (screenHeight / 2))

    //----------------------------------------------------------------------------------

    // Draw
    //----------------------------------------------------------------------------------
    r.BeginDrawing();

    r.ClearBackground(r.RAYWHITE);

    r.BeginMode2D(camera);

    r.DrawRectangle(-6000, 320, 13000, 8000, r.DARKGRAY);

    for (var i = 0; i < MAX_BUILDINGS; i++) {
        r.DrawRectangleRec(buildings[i], buildColors[i]);
    }

    Object.keys(players).forEach(id => {
        let player = players[id];
        let pos = r.Rectangle(player.pos.x, 280, 40, 40);

        r.DrawRectangleRec(pos, r.RED);
        r.DrawText(id, pos.x, pos.y - 20, 20, r.BLACK);
    });

    r.DrawRectangleRec(player, r.RED);
    r.DrawText("You", player.x, player.y - 20, 20, r.BLACK);
    
    r.EndMode2D();

    r.EndDrawing();
    //----------------------------------------------------------------------------------


    if (r.WindowShouldClose()) {
        clearInterval(interval);
        r.CloseWindow();
        process.exit();
    }
});

// Connecting to server
//----------------------------------------------------------------------------------
client.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
});

function PopulatePlayerData(id) {
    // populate player with custom structure

    console.log("Added " + id + " to client player list");

    players[id] = { "pos": { x: 0, y: 0, z: 0 } };
}

client.on('connect', function (connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function (error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function () {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            let split = message.utf8Data.split(" | ");
            let date = new Date(split[0]); // can be used to prevent desync
            let id = split[1];
            let action = split[2];
            let data = JSON.parse(split[3]);

            //console.log(`${action} action from ${id}`);

            // handle custom actions
            switch (action) {
                case "Move":
                    if (!players.hasOwnProperty(id)) PopulatePlayerData(id);

                    players[id].pos.x = data.x;
                    players[id].pos.y = data.y;
                    break;

                case "MoveClient":
                    player.x = data.x;
                    player.y = data.y;

                    break;

                // handle player leave event
                case "RemovePlayer":
                    delete players[id];
                    break;
            }
        }
    });

    function keepAlive() {
        if (connection.connected) {
            connection.sendBytes(Buffer.alloc(0));
        }
    }

    setInterval(keepAlive, 1000);

    function SendPacket() { // send packet when value of packet has changed and websocket is connected
        if (previousPacket !== packet && connection.connected) {
            connection.sendUTF(packet);
        }
    }

    setInterval(SendPacket, packetDelay);
});

client.connect(`ws://localhost:8080/`, 'echo-protocol');