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
			var openSlots = 4 - Object.keys(room.players).length;
			roomsHTML += "<a href='player/index.html?id=" + room.id + "'><button " + (openSlots === 0 ? "disabled" : "") + ">Game " + room.id + " (" + openSlots + " open slots) </button></a>";
		});

		document.getElementById("rooms").innerHTML += roomsHTML;
	});

	document.getElementById("newRoom").addEventListener("click", function() {
		socket.emit("newRoom");
	}, false);

	socket.emit("requestCurrentRooms");
})();