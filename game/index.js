(function() {
	"use strict";

	var socket = io();
	socket.on("room", function(room) {
		window.location.href += "host/index.html?id=" + room.id;
	});

	socket.on("currentRooms", function(rooms) {
		console.log("[index.js: 10]\n   ", rooms);
		var roomsHTML = "";
		rooms.forEach(function(room) {
			roomsHTML += "<button id=" + room.id + ">" + room.id + "</room>";
		});

		document.body.innerHTML = roomsHTML + document.body.innerHTML;
	});

	document.addEventListener("click", function(event) {
		if (event.target.id === "newRoom") {
			socket.emit("newRoom");
		}
		// existing room
		else {
			window.location.href += "client/index.html?id=" + event.target.id
		}
	});

	socket.emit("requestCurrentRooms");
})();