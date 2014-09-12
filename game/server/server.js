/* jshint node:true */
"use strict";

// modules
var io = require("sandbox-io");

var Room = require("./room");
var Player = require("./player");
var Target = require("./target");

// variables
var rooms = {};

// socket.io
io.on("connection", function(socket) {
	// lobby
	socket.on("requestCurrentRooms", function() {
		var roomsArray = [];

		for (var roomKey in rooms) {
			roomsArray.push(rooms[roomKey].info());
		}

		socket.emit("currentRooms", roomsArray);
	});

	// TODO: rename to requestNewRoom
	socket.on("newRoom", function() {
		var room = new Room();
		room.fill();
		rooms[room.id] = room;
		// TODO: rename accordingly to TODO above
		socket.emit("room", room.info());
	});

	// TODO: rename client to player
	// client
	// TODO: rename "client" to "playerConnect"
	socket.on("client", function(roomId) {
		var room = rooms[roomId];

		if (room === undefined) {
			socket.emit("noSuchRoom");
			return;
		}

		// TODO: 4 should be const
		if (room.numberOfPlayers() >= 4) {
			socket.emit("roomFull");
			return;
		}

		var player = new Player();
		room.addPlayer(player);

		// TODO: rename "move" ("playerMove"/"playerMoved"/"newPlayerMove"?)
		socket.on("move", function(diffX, diffY) {
			diffX = player.x - diffX;
			diffY = player.y - diffY;

			// restrict players to game field bounds
			player.x = Math.min(Math.max(0, diffX), 1 - Player.SIZE);
			player.y = Math.min(Math.max(0, diffY), 1 - Player.SIZE);
		});

		// TODO: "fire" -> "playerFired"
		socket.on("fire", function(id) {
			var player = room.players[id];
			var x = player.x + Player.SIZE / 2;
			var y = player.y + Player.SIZE / 2;
			// TODO: "fired" -> "playerFired"
			room.emitToHosts("fired", {
				x: x,
				y: y,
				player: player
			});
			room.targets.forEach(function(target) {
				if (Target.SIZE + Math.sqrt(2 * Math.pow(Player.SIZE / 2, 2)) > Math.max(Math.abs(x - target.x), Math.abs(y - target.y))) {
					player.score++;
					if (player.score >= 10) {
						room.updateHosts();
						// TODO: "winner" -> "gameWon"
						room.emitToHosts("winner", player);
						room.stop();
					}
					// TODO: room.removeTarget(target);
					room.targets.splice(room.targets.indexOf(target), 1);
					setTimeout(room.newTarget.bind(room), 2000);
				}
			});
		});
		socket.on("disconnect", function() {
			room.removePlayer(player);
		});
		// TODO: "clientPlayer" -> "playerInfo"
		socket.emit("clientPlayer", player);
	});

	// host
	socket.on("host", function(roomId) {
		var room = rooms[roomId];

		if (room === undefined) {
			return;
		}

		// TODO: "sizes" -> "objectSizes"
		socket.emit("sizes", {
			pointSize: Player.SIZE,
			targetRadius: Target.SIZE
		});
		room.hosts.push(socket);

		// TODO: "reset" -> "requestReset"
		socket.on("reset", function() {
			room.reset();
		});

		socket.on("disconnect", function() {
			room.removeHost(socket);
			if (room.hosts.length === 0) {
				setTimeout(function() {
					delete rooms[roomId];
				}, 2000);
			}
		});
	});
});
