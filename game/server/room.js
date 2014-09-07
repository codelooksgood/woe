/* jshint node:true */
"use strict";

var Room = function(id) {
	this.id = Math.floor(Math.random() * 9000 + 1000).toString();
	this.points = [];
	this.targets = [];
	this.hosts = [];

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
	this.targets.forEach(function(target) {
		target.move();
	});
	this.updateHosts();
	setTimeout(this.tick.bind(this), 25);
};

module.exports = Room;