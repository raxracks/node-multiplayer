let movement_limit = 2;

module.exports.PopulateData = function(playerID, PlayerManager) {
	let player = PlayerManager.GetPlayer(playerID);
	
	player["pos"] = {x: 0, y: 0, z: 0};

	PlayerManager.UpdatePlayer(playerID, player);

	console.log(`[${new Date()}] Populated data of Player ${playerID}`);
}

module.exports.Actions = {
	"Move": function(playerID, ActionSystem, PlayerManager, data) {
		let player = PlayerManager.GetPlayer(playerID);

		if(Math.abs(player.pos.x - data.x) > movement_limit || Math.abs(player.pos.y - data.y) > movement_limit || Math.abs(player.pos.z - data.z) > movement_limit) {
			console.log("Player moved too fast!");
			ActionSystem.SendLocalAction(player.connection, playerID, "MoveClient", player.pos);
			
			return 0;
		}

		player.pos.x = data.x;
		player.pos.y = data.y;
		player.pos.z = data.z;

		PlayerManager.UpdatePlayer(playerID, player);

		return 1;
	}
}