/* jshint node:true */
"use strict";

var id = 0;
var Target = function(x, y, room) {
	this.x = x || 0;
	this.y = y || 0;
	this.room = room;
	this.id = id;
	id++;

	this.baseY = this.y;
	this.rand1 = .01// Math.random() * 0.075 + 0.075;
	this.rand2 = .5 //Math.random() * 2.5;
	this.progress = 0;
};

Target.new = function(room) {
	var target = new Target(0, Math.random() * 0.6 + 0.2, room);
	target.move();
	room.addTarget(target);

	return target;
};

Target.prototype.move = function() {
	this.progress += 0.01;

	this.x = 0.02 * this.progress;
	this.y = this.baseY + this.rand1 * Math.sin(this.rand2 * this.progress);
	if (this.x > 1) {
		var index = this.room.targets.indexOf(this);
		if (index >= 0) {
			this.room.targets.splice(index, 1);
			Target.new(this.room);
		}
	}
};

Target.prototype.info = function () {
	return {
		id: this.id,
		x: this.x,
		y: this.y
	};
};

module.exports = Target;