/* jshint node:true */
"use strict";

var id = 0;
var randomColor = function() {
	var r = Math.floor(Math.random() * 255);
	var g = Math.floor(Math.random() * 255);
	var b = Math.floor(Math.random() * 255);
	return "rgb(" + r + "," + g + "," + b + ")";
};

var Point = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
	this.id = id;
	id++;
	this.color = randomColor();
	this.score = 0;
};

module.exports = Point;