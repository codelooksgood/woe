(function() {
	"use strict";

	// helper

	// constants
	var FONT_SIZE = 20;
	var DEFAULT_MARGIN = 10;

	// set by server
	var POINT_SIZE = null;
	var IMAGE_SIZE = null;

	// variables
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	var points = [];
	var targets = [];
	var fires = [];
	var image = new Image();
	image.src = "apple.png";

	// canvas
	canvas.width = canvas.parentElement.clientWidth;
	canvas.height = canvas.parentElement.clientHeight;
	context.font = FONT_SIZE + "pt Arial";
	context.textBaseline = "top";
	context.textAlign = "right";
	var draw = function() {
		context.clearRect(0, 0, canvas.width, canvas.height);

		var firesToRemove = [];
		fires.forEach(function(fire) {
			var radius = (Date.now() - fire.timestamp) / (2 * POINT_SIZE.WIDTH * canvas.width) + POINT_SIZE.WIDTH * canvas.width / 2;
			if (radius < 0) {
				return;
			}
			if (radius > 30) {
				firesToRemove.push(fire);
				return;
			}
			context.strokeStyle = fire.point.color;
			context.lineWidth = 5;
			context.beginPath();
      		context.arc(fire.x * canvas.width, fire.y * canvas.height, radius, 0, 2 * Math.PI, false);
      		context.stroke();
		});

		firesToRemove.forEach(function(fire) {
			fires.splice(fires.indexOf(fire), 1);
		});

		targets.forEach(function(target) {
			context.drawImage(image, target.x * canvas.width, target.y * canvas.height, IMAGE_SIZE.WIDTH * canvas.width, IMAGE_SIZE.HEIGHT * canvas.width);
		});

		points.sort(function(point1, point2) {
			return point1.score < point2.score;
		}).forEach(function(point, index) {
			context.fillStyle = point.color;
			context.fillRect(point.x * canvas.width, point.y * canvas.height, POINT_SIZE.WIDTH * canvas.width, POINT_SIZE.HEIGHT * canvas.width);
			// score
			var y = FONT_SIZE + (FONT_SIZE + 2 * DEFAULT_MARGIN) * index;
			var width = (canvas.width / 100) * point.score;
			context.fillRect(canvas.width - (width + DEFAULT_MARGIN), y, width, FONT_SIZE + DEFAULT_MARGIN);
			context.fillStyle = "rgb(0, 0, 0)";
			context.fillText(point.score, canvas.width - (FONT_SIZE + DEFAULT_MARGIN), y);
		});

		requestAnimationFrame(draw);
	};

	// socket.io
	console.log("[index.js: 74]\n   ");
	var socket = io();

	socket.on("update", function(room) {
		points = room.points;
		targets = room.targets;
	});

	socket.on("sizes", function(sizes) {
		POINT_SIZE = sizes.pointSize;
		IMAGE_SIZE = sizes.imageSize;
	});

	socket.on("fired", function(fire) {
		fire.timestamp = Date.now();
		fires.push(fire);
	});

	socket.on("connect", function() {
		socket.emit("host", decodeURIComponent((new RegExp('[?|&]id=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null);
	});

	// events
	window.addEventListener("resize", function() {
		canvas.width = canvas.parentElement.clientWidth;
		canvas.height = canvas.parentElement.clientHeight;
	});

	// initial draw
	draw();
})();