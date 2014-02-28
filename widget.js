var Widget = function(element, options) {
	this.element = $(element);
	this.options = options || {};
	this.handlers = [];
};

Widget.prototype = {
	observe: function(eventName, handler) {
		this.element.observe("widget:"+eventName, handler);
		this.handlers.push({name: eventName, handler: handler});
	},
	stopObserving: function(eventName, handler) {
		this.element.stopObserving("widget:"+eventName, handler);
	},
	fire: function(eventName, memo) {
		this.element.fire("widget:"+eventName, memo);
	},
	
	bind: function(handlers) {
		handlers.each(function(handler) {
			this[handler] = this[handler].bindAsEventListener(this);
		}, this);
	},
	
	destroy: function() {
		this.handlers.each(function(h) {
			this.stopObserving(h.name, h.handler);
		}.bind(this));
	},
	
	get: function(key) {
		return this.options[key];
	},
	set: function(key, value) {
		this.options[key] = value;
	}
};