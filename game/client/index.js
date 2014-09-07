(function() {
	"use strict";

	// helper
	var addEventListener = function(elements, events, callback) {
		elements.forEach(function(element) {
			events.forEach(function(event) {
				element.addEventListener(event, callback);
			});
		});
	};

	// variables
	var currentX = null;
	var currentY = null;
	var didStart = false;
	var downStart = null;
	var clientId = null;
	var lastFire = 0;

	// socket.io
	var socket = io();

	socket.on("connect", function() {
		socket.emit("client", decodeURIComponent((new RegExp('[?|&]id=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null);
	});

	socket.on("clientId", function(id) {
		clientId = id;
	});

	// events
	addEventListener([document.body], ["mousedown", "touchstart"], function(event) {
		downStart = Date.now();

		var x = event.pageX;
		var y = event.pageY;

		if (event.touches !== undefined) {
			x = event.touches[0].pageX;
			y = event.touches[0].pageY;
		}

		currentX = x;
		currentY = y;
		didStart = true;
	});

	addEventListener([document.body], ["mouseup", "touchend"], function() {
		var time = Date.now();
		if (time - downStart < 150 && time - lastFire > 1000) {
			lastFire = time;
			socket.emit("fire", clientId);
		}
		didStart = false;
	});

	addEventListener([document.body], ["mousemove", "touchmove"], function(event) {
		event.preventDefault();

		var x = event.pageX;
		var y = event.pageY;

		if (event.touches !== undefined) {
			x = event.touches[0].pageX;
			y = event.touches[0].pageY;
		}

		if (currentX !== null && currentY !== null && didStart) {
			socket.emit("move", (currentX - x) / document.body.clientWidth, (currentY - y) / document.body.clientHeight);
		}

		currentX = x;
		currentY = y;
	});
})();