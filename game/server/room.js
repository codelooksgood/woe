/* jshint node:true */
"use strict";

var Room = function(id) {
	this.id = Math.floor(Math.random() * 9000 + 1000).toString();
	this.points = [];
	this.targets = [];
	this.hosts = [];
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
	this.updateHosts();
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

module.exports = Room;