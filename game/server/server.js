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

var IMAGE_SIZE = {
	WIDTH: 0.075,
	HEIGHT: 0.1
};

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
		for (var i = 0; i < 5; i++) {
			setTimeout(Target.new.bind(Target, room), i * 2000);
		}
		rooms.push(room);
		socket.emit("room", room.info());
	});

	// client
	socket.on("client", function(id) {
		console.log("[server.js: 132]\n   ", "client connected");
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

		var point = new Point();
		room.points.push(point);

		socket.on("move", function(x, y) {
			point.x -= x;
			point.y -= y;
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
						var targetX = target.x + IMAGE_SIZE.WIDTH / 2;
						var targetY = target.y + IMAGE_SIZE.HEIGHT / 2;
						if (Math.abs(targetX - x) < (IMAGE_SIZE.WIDTH + POINT_SIZE.WIDTH) / 2 && Math.abs(targetY - y) < (IMAGE_SIZE.HEIGHT  + POINT_SIZE.HEIGHT) / 2) {
							point.score++;
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
		socket.emit("clientId", point.id);
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
				imageSize: IMAGE_SIZE
			});
			room.hosts.push(socket);
		}
	});
});
