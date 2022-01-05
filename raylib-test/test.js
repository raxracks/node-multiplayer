const r = require('raylib');
const WebSocketClient = require('websocket').client;
const client = new WebSocketClient();
const players = {};
let packet = {};
let previousPacket = packet;
let currentConnection = undefined;

// Initialization
//--------------------------------------------------------------------------------------
const screenWidth = 800
const screenHeight = 450

r.InitWindow(screenWidth, screenHeight, "raylib js multiplayer")

// Define the camera to look into our 3d world
let camera = r.Camera3D(
    r.Vector3(3, 1, 0), // Camera position
    r.Vector3(),          // Camera looking at point
    r.Vector3(0, 1, 0),   // Camera up vector (rotation towards target)
    60,                   // Camera field-of-view Y
    r.CAMERA_PERSPECTIVE  // Camera mode type
)

r.SetCameraMode(camera, r.CAMERA_FIRST_PERSON); 

r.SetTargetFPS(60);               // Set our game to run at 60 frames-per-second
//--------------------------------------------------------------------------------------

// Main game loop
let interval = setInterval(() => { // using intervals to prevent blocking thread for websocket
    // Update
    //----------------------------------------------------------------------------------
    r.UpdateCamera(camera);                  // Update camera

    packet = `Move | ${JSON.stringify({pos: {x: camera.position.x, y: camera.position.y, z: camera.position.z}})}`;
    //----------------------------------------------------------------------------------

    // Draw
    //----------------------------------------------------------------------------------
    r.BeginDrawing();

    r.ClearBackground(r.RAYWHITE);

    r.BeginMode3D(camera);

    Object.keys(players).forEach(id => {
        let player = players[id];
        let pos = r.Vector3(player.pos.x, player.pos.y, player.pos.z);

        r.DrawCube(pos, 2, 2, 2, r.RED);
        r.DrawCubeWires(pos, 2, 2, 2, r.MAROON);
    });

    r.DrawGrid(10, 1);

    r.EndMode3D();

    r.DrawText("multiplayer", 10, 40, 20, r.DARKGRAY);

    r.DrawFPS(10, 10);

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

                    players[id].pos.x = data.pos.x;
                    players[id].pos.y = data.pos.y;
                    players[id].pos.z = data.pos.z;
                    break;

                case "MoveClient":
                    camera.position.x = data.pos.x;
                    camera.position.y = data.pos.y;
                    camera.position.z = data.pos.z;

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

    function SendPacket() {
        if(previousPacket !== packet && connection.connected) {
            connection.sendUTF(packet);
        }
    }

    setInterval(SendPacket);
});

client.connect(`ws://localhost:8080/`, 'echo-protocol');