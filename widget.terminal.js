Widget.Terminal = function(element) {
	this.super(element);
	
	// initialize
	this.element.terminal = this;
	this.index = null;
	this.entries = [];
	
	this.bind($w("onKeypress"));
	this.element.observe("keypress", this.onKeypress);
};
Widget.Terminal.prototype = {
	enter: function() {
		var value = this.element.value;
		if (value != "") {
			this.element.value = "";
			this.element.focus();
			
			// handle entry
			this.entries.push(value);
			this.fire("enter", value);
			
			// reset
			this.index = null;
		}
		
		return value;
	},
	
	getIndex: function() {
		switch (true) {
			case (this.index == null):
				return this.entries.length;
			case (this.index < -1):
				return -1;
			case (this.index >= this.entries.length):
				return this.entries.length;
			default:
				return this.index;
		}
	},
	
	up: function() {
		var index = this.getIndex() - 1, entry = this.entries[index];
		if (entry) {
			this.element.value = entry;
		} else {
			this.element.value = "";
		}
		
		this.index = index;
	},
	
	down: function() {
		var index = this.getIndex() + 1, entry = this.entries[index];
		if (entry) {
			this.element.value = entry;
		} else {
			this.element.value = "";
		}
		
		this.index = index;
	},
	
	/** handlers **/
	onKeypress: function(e) {
		var keyCode = e.keyCode;
		var shiftKey = e.shiftKey;
		
		if (keyCode == Event.KEY_RETURN && !shiftKey) {
			this.enter();
			e.stop();
		} else if (keyCode == Event.KEY_UP) {
			this.up();
		} else if (keyCode == Event.KEY_DOWN) {
			this.down();
		}
	}
};

Object.inherit(Widget.Terminal, Widget);