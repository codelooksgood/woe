(function() {
	"use strict";

	var socket = window.io();
	socket.on("room", function(room) {
		window.location.href += "host/index.html?id=" + room.id;
	});

	socket.on("currentRooms", function(rooms) {
		var roomsHTML = "";
		rooms.sort(function(room1, room2) {
			return room1.id > room2.id;
		}).forEach(function(room) {
			var openSlots = 4 - room.points.length;
			roomsHTML += "<button id=" + room.id + " " + (openSlots === 0 ? "disabled" : "") + ">Host " + room.id + " (" + openSlots + " open slots)" + "</room>";
		});

		document.getElementById("index").innerHTML += roomsHTML;
	});

	document.addEventListener("click", function(event) {
		if (event.target.tagName === "BUTTON") {
			if (event.target.id === "newRoom") {
				socket.emit("newRoom");
			}
			// existing room
			else {
				window.location.href += "client/index.html?id=" + event.target.id;
			}
		}
	});

	socket.emit("requestCurrentRooms");
})();