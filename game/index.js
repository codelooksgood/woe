(function() {
	"use strict";

	var socket = io();
	socket.on("room", function(room) {
		window.location.href += "host/?id=" + room.id;
	});

	document.getElementById("newRoom").addEventListener("click", function() {
		socket.emit("newRoom");
	});
})();