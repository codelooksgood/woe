(function() {
	"use strict";

	// helper
	// from underscore.js
	var toArray = function(object) {
		var array = [];
		var keys = Object.keys(object);
		for (var i = 0; i < keys.length; i++) {
			array.push(object[keys[i]]);
		}
		return array;
	};

	// constants
	var FONT_SIZE = 20;

	// set by server
	var POINT_SIZE = null;
	var TARGET_RADIUS = null;

	// variables
	var isGameRunning = true;
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	var points = [];
	var oldPoints = [];
	var targets = [];
	var fires = [];

	var isPlayerInfoNew = function() {
		var getHash = function(array) {
			return JSON.stringify(array.map(function(el) {
				return el.id + " " + el.score;
			}));
		};

		return getHash(points) !== getHash(oldPoints);
	};

	// canvas
	var resizeCanvas = function() {
		var min = Math.min(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
		canvas.width = min - 20;
		canvas.height = min - 20;
	};
	resizeCanvas();

	context.font = FONT_SIZE + "pt Arial";
	context.textBaseline = "top";
	context.textAlign = "right";
	var draw = function() {
		if (isGameRunning) {
			context.clearRect(0, 0, canvas.width, canvas.height);

			var firesToRemove = [];
			fires.forEach(function(fire) {
				var radius = (Date.now() - fire.timestamp) / (2 * POINT_SIZE * canvas.width) + POINT_SIZE * canvas.width / 2;
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
				context.fillStyle = "rgb(220, 0, 0)";
				context.beginPath();
				context.arc(target.x * canvas.width, target.y * canvas.height, TARGET_RADIUS * canvas.width, 0, 2 * Math.PI, false);
				context.fill();
			});
		}

		var sortedPoints = points.sort(function(point1, point2) {
			return point1.id > point2.id;
		});

		sortedPoints.forEach(function(point) {
			context.fillStyle = point.color;
			context.fillRect(point.x * canvas.width, point.y * canvas.height, POINT_SIZE * canvas.width, POINT_SIZE * canvas.width);
		});

		if (isPlayerInfoNew()) {
			oldPoints = points;

			if (points.length === 0) {
				document.getElementById("players").innerHTML = "Waiting for players ...";
			}
			else {
				document.getElementById("players").innerHTML = "";
			}

			sortedPoints.forEach(function(point, index) {
				// score
				document.getElementById("players").innerHTML += "<h2 class='player'>Player " + (index + 1) + "</h2>";
				document.getElementById("players").innerHTML += "<div id='scoreBoxContainer" + index + "' class='scoreBoxContainer'></div>";
				for (var i=0; i < point.score; i++) {
					document.getElementById("scoreBoxContainer" + index).innerHTML += "<div class='scoreBox' style='background-color: " + point.color + ";'></div>";
				}
			});
		}

		window.requestAnimationFrame(draw);
	};

	// socket.io
	var socket = window.io();

	socket.on("update", function(room) {
		isGameRunning = true;
		points = toArray(room.points);
		targets = room.targets;
	});

	socket.on("sizes", function(sizes) {
		POINT_SIZE = sizes.pointSize;
		TARGET_RADIUS = sizes.targetRadius;
	});

	socket.on("fired", function(fire) {
		fire.timestamp = Date.now();
		fires.push(fire);
	});

	socket.on("connect", function() {
		socket.emit("host", decodeURIComponent((new RegExp("[?|&]id=" + "([^&;]+?)(&|#|;|$)").exec(window.location.search)||[,""])[1].replace(/\+/g, "%20")) || null);
	});

	socket.on("winner", function(point) {
		isGameRunning = false;
		var winnerIndex = points.map(function(point) {
			return point.id;
		}).indexOf(point.id);

		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = point.color;
		context.textAlign = "center";
		context.fillText("Congratulation Player " + (winnerIndex + 1) + "!", canvas.width / 2, canvas.height / 2);

	});

	// events
	window.addEventListener("resize", resizeCanvas);

	document.getElementById("reset").addEventListener("click", function() {
		socket.emit("reset");
	}, false);

	// initial draw
	draw();
})();