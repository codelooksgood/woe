/* jshint node:true */
// modules
var io = require("sandbox-io");

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

// room
var Room = function(id) {
	"use strict";

	this.id = Math.floor(Math.random() * 9000 + 1000).toString();
	this.points = [];
	this.targets = [];
};

Room.prototype.info = function() {
	return {
		id: this.id,
		targets: this.targets.map(function(target) {
			return target.info();
		}),
		points: this.points,
	};
};

Room.prototype.newTarget = function() {
	"use strict";

	var target = new Target(0, Math.random() * 0.6 + 0.2, this);
	this.targets.push(target);
	target.move();
	this.updateHosts();
};

Room.prototype.updateHosts = function() {
	io.of("/host/").in(this.id).emit("update", this.info());
};

// Point
var id = 0;
var randomColor = function() {
	"use strict";
	var r = Math.floor(Math.random() * 255);
	var g = Math.floor(Math.random() * 255);
	var b = Math.floor(Math.random() * 255);
	return "rgb(" + r + "," + g + "," + b + ")";
};
var Point = function(x, y) {
	"use strict";

	this.x = x || 0;
	this.y = y || 0;
	this.id = id;
	id++;
	this.color = randomColor();
	this.score = 0;
};

// target
var Target = function(x, y, room) {
	"use strict";

	this.x = x || 0;
	this.y = y || 0;
	this.room = room;
	this.id = id;
	id++;

	this.baseY = this.y;
	this.rand1 = Math.random() * 0.075 + 0.075;
	this.rand2 = Math.random() * 2.5;
	this.progress = 0;
};

Target.prototype.move = function() {
	"use strict";

	this.progress += 0.1;

	this.x = 0.02 * this.progress;
	this.y = this.baseY + this.rand1 * Math.sin(this.rand2 * this.progress);
	if (this.x < 1) {
		setTimeout(this.move.bind(this), 25);
	}
	else {
		var index = this.room.targets.indexOf(this);
		if (index >= 0) {
			this.room.targets.splice(index, 1);
			this.room.newTarget();
		}
	}

	this.room.updateHosts();
};

Target.prototype.info = function () {
	return {
		id: this.id,
		x: this.x,
		y: this.y
	};
};

// socket.io

io.of("/client/").on("connection", function(socket) {
	"use strict";

	console.log("client connected");

	socket.on("id", function(id) {
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
		room.updateHosts();

		socket.on("move", function(x, y) {
			point.x -= x;
			point.y -= y;
			room.updateHosts();
		});
		socket.on("fire", function(id) {
			room.points.forEach(function(point) {
				if (point.id === id) {
					var x = point.x + POINT_SIZE.WIDTH / 2;
					var y = point.y + POINT_SIZE.HEIGHT / 2;
					io.of("/host/").in(room.id).emit("fired", {
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
							setTimeout(room.newTarget.bind(room), 2000);
						}
					});
				}
			});
			room.updateHosts();
		});
		socket.on("disconnect", function() {
			room.points.splice(room.points.indexOf(point), 1);
			room.updateHosts();
		});
		socket.emit("id", point.id);
	});
});

io.of("/host/").on("connection", function(socket) {
	"use strict";

	console.log("host connected");

	socket.on("id", function(id) {
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
			socket.emit("update", room.info());
		}
	});
});

io.on("connection", function(socket) {
	socket.on("newRoom", function() {
		var room = new Room();
		for (var i = 0; i < 5; i++) {
			setTimeout(room.newTarget.bind(room), i * 2000);
		}
		rooms.push(room);
		socket.emit("room", room.info());
	});
});
