/* jshint node:true */
"use strict";

var Target = require("./target");

var Room = function() {
	this.id = Math.floor(Math.random() * 9000 + 1000).toString();
	this.points = [];
	this.targets = [];
	this.hosts = [];
	this.stopped = false;

	this.tick();
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

Room.prototype.fill = function() {
	for (var i = 0; i < 5 - this.targets.length; i++) {
		setTimeout(Target.new.bind(Target, this), i * 2000);
	}
};

Room.prototype.addTarget = function(target) {
	this.targets.push(target);
};

Room.prototype.updateHosts = function() {
	this.hosts.forEach(function(hostSocket) {
		hostSocket.emit("update", this.info());
	}, this);
};

Room.prototype.emitToHosts = function() {
	var args = arguments;
	this.hosts.forEach(function(hostSocket) {
		hostSocket.emit.apply(hostSocket, args);
	}, this);
};

Room.prototype.tick = function() {
	if (!this.stopped) {
		this.targets.forEach(function(target) {
			target.move();
		});
		this.updateHosts();
		setTimeout(this.tick.bind(this), 25);
	}
};

Room.prototype.stop = function() {
	this.stopped = true;
};

Room.prototype.reset = function() {
	this.points.forEach(function(point) {
		point.score = 0;
	});
	this.targets = [];
	this.fill();
	if (this.stopped) {
		this.stopped = false;
		this.tick();
	}
};

module.exports = Room;