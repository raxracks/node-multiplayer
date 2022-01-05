# Node Multiplayer
Node Multiplayer is a customizable multiplayer framework which does not require any modifications to the code itself to get working.

## Config
In config.js, you will notice a basic config has been setup for you, this config is very basic and simply provides replicated movement across client and server for the raylib test.

### Actions
You can add any new action to the `module.exports.Actions` object and define behavior and the server will automatically carry out the action whenever the client requests it.

### Data Structure
Because different games have different player data structures, no predefined data structure has been determined, when a player connects to the server the `PopulateData` function inside of your config file will be called, along with the player object so that you can manipulate the data.

The player structure by default only contains the player connection, but the connection is important for sending messages to the client, as well as broadcasting messages to all clients. So do not override this value, simply add other items to the object such as `position` or `team`.