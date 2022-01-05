module.exports.PlayerManager = class {
    constructor() {
        this.players = {};

        this.AddPlayer = function(id, connection, type) {
            this.players[id] = {connection};

            console.log(`[${new Date()}] [PlayerManager] Player ${id} connected.`);

            this.PopulateData(id);
        }

        this.RemovePlayer = function(id) {
            delete this.players[id];

            console.log(`[${new Date()}] [PlayerManager] Player ${id} disconnected.`);
        }

        this.PopulateData = function(id) {
            // implement player structure here
            this.players[id]["pos"] = {x: 0, y: 0, z: 0};
        }

        this.GetPlayer = function(id) {
            return this.players[id];
        }

        this.UpdatePlayer = function(id, data) {
            this.players[id] = data;
        }

        this.GetPlayers = function(id) {
            return this.players;
        }
    }
}