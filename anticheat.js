module.exports.AntiCheat = class {
    constructor(PlayerManager) {
        this.RequestAction = function(id, action, data) {
            let player = PlayerManager.GetPlayer(id);

            // this is where you can define custom actions
            switch(action) {
                case "Move":
                    let movement_limit = 2;

                    if(Math.abs(player.pos.x - data.pos.x) > movement_limit || Math.abs(player.pos.y - data.pos.y) > movement_limit || Math.abs(player.pos.z - data.pos.z) > movement_limit) {
                        console.log("Player moved too fast!");

                        player.connection.sendUTF(`${new Date()} | ${id} | MoveClient | ${JSON.stringify({pos: {x: player.pos.x, y: player.pos.y, z: player.pos.z}})}`);
                        return 0;
                    }

                    player.pos.x = data.pos.x;
                    player.pos.y = data.pos.y;
                    player.pos.z = data.pos.z;

                    PlayerManager.UpdatePlayer(id, player);

                    return 1;

                    break;
            }
        }
    }
}