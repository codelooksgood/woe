/* jshint node:true */
"use strict";

// modules
var io = require("sandbox-io");

var Room = require("./room");
var Point = require("./point");
var Target = require("./target");

// constants
var POINT_SIZE = {
	WIDTH: 0.025,
	HEIGHT: 0.025
};

var TARGET_RADIUS = 0.05;

// variables
var rooms = [];

// socket.io
io.on("connection", function(socket) {
	// start
	socket.on("requestCurrentRooms", function() {
		socket.emit("currentRooms", rooms.map(function(room) {
			return room.info();
		}));
	});

	socket.on("newRoom", function() {
		var room = new Room();
		room.fill();
		rooms.push(room);
		socket.emit("room", room.info());
	});

	// client
	socket.on("client", function(id) {
		var room = null;
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].id === id) {
				room = rooms[i];
				break;
			}
		}

		if (room === null) {
			return;
		}

		if (room.points.length >= 4) {
			socket.emit("roomFull");
			return;
		}

		var point = new Point();
		room.points.push(point);

		console.log("[server.js: 132]\n   ", "client connected to room", room.id);

		socket.on("move", function(x, y) {
			x = point.x - x;
			y = point.y - y;

			point.x = Math.min(Math.max(0, x), 1 - POINT_SIZE.WIDTH);
			point.y = Math.min(Math.max(0, y), 1 - POINT_SIZE.HEIGHT);
		});
		socket.on("fire", function(id) {
			room.points.forEach(function(point) {
				if (point.id === id) {
					var x = point.x + POINT_SIZE.WIDTH / 2;
					var y = point.y + POINT_SIZE.HEIGHT / 2;
					room.emitToHosts("fired", {
						x: x,
						y: y,
						point: point,
						timestamp: new Date().getTime()
					});
					room.targets.forEach(function(target) {
						if (TARGET_RADIUS + Math.sqrt(2 * Math.pow(POINT_SIZE.WIDTH / 2, 2)) > Math.max(Math.abs(x - target.x), Math.abs(y - target.y))) {
							point.score++;
							if (point.score >= 10) {
								room.updateHosts();
								room.emitToHosts("winner", point);
								room.stop();
							}
							room.targets.splice(room.targets.indexOf(target), 1);
							setTimeout(Target.new.bind(Target, room), 2000);
						}
					});
				}
			});
		});
		socket.on("disconnect", function() {
			room.points.splice(room.points.indexOf(point), 1);
		});
		socket.emit("clientPoint", point);
	});

	// host
	socket.on("host", function(id) {
		console.log("[server.js: 186]\n   ", "host connected");
		var room = null;
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].id === id) {
				room = rooms[i];
				break;
			}
		}

		if (room !== null) {
			socket.join(room.id);
			socket.emit("sizes", {
				pointSize: POINT_SIZE,
				targetRadius: TARGET_RADIUS
			});
			room.hosts.push(socket);
		}

		socket.on("reset", function() {
			room.reset();
		});
	});
});
