(function() {
	"use strict";

	var objects = [];
	var conetxt = null;

	var CLGCExtend = function(Base, Constructor) {
		var Wrapper = function() {
			var self = this || {};
			Base.apply(self, arguments)
			Constructor.apply(self, arguments);
		};

		Wrapper.prototype = Object.create(Base.prototype);

		return Wrapper;
	};

	var CLGCObject = function() {
		this.foo = "bar";
	};

	CLGCObject.prototype.render = function() {
		// empty fallback
	};

	window.CLGCView = CLGCExtend(CLGCObject, function(frame) {
		this.frame = frame;
		this.render = function(context) {
			if (typeof this.backgroundColor === "string") {
				context.fillStyle = this.backgroundColor;
				context.fillRect(this.frame.x, this.frame.y, this.frame.width, this.frame.height);
			}
			context.strokeRect(this.frame.x, this.frame.y, this.frame.width, this.frame.height);
		};
	});

	window.CLGCButton = CLGCExtend(CLGCView, function() {
		this.listeners = [];

		document.addEventListener("mouseup", function() {
			this.fire("click", this);
		}, this);
	});

	CLGCButton.prototype.on = function(eventName, callback, context) {
		this.listeners.push({
			event: event,
			callback: callback,
			context: context
		});
	};

	CLGCButton.prototype.fire = function(eventName) {
		var args = Array.prototype.slice(arguments);
		this.listeners.forEach(function(listener) {
			if (listener.event === event) {
				listener.callback.call(listener.context, args);
			}
		});
	};

	var CLGC = {
		render: function() {
			if (canvas !== null) {
				objects.sort(function(object1, object2) {
					return object.zIndex < object2.zIndex;
				}).forEach(function(object) {
					object.render(conetxt);
				});
			}
		},
		setCanvas: function(aCanvas) {
			canvas = aCanvas;
		},
		startRendering: function() {
			window.requrstAnimationFrame(GLGC.render);
		},
		addObject: function(object) {
			if (object instanceof CLGCObject) {
				objects.push(object);
			}
		}
	};

	window.CLGC = CLGC;
})();