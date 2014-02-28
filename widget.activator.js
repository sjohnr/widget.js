Widget.Activator = function(element, options) {
	this.super(element, Object.extend({
		className: null,
		hoverClassName: "hover",
		activeClassName: "active",
		selectedClassName: "selected",
		focusClassName: "focus",
		disabledClassName: "disabled"
	}, options || {}));
	
	// bind event handlers to instance
	this.bind($w("onMouseover onMouseout onMousedown onMouseup onClick onDblClick onContextmenu onFocus onBlur"));
	
	// add base class name
	if (this.get("className")) {
		this.element.addClassName(this.get("className"));
	}
	
	// observe DOM events
	this.element.observe("mouseover", this.onMouseover);
	this.element.observe("mouseout", this.onMouseout);
	this.element.observe("mousedown", this.onMousedown);
	this.element.observe("mouseup", this.onMouseup);
	this.element.observe("click", this.onClick);
	//this.element.observe("dblclick", this.onDblClick);
	this.element.observe("contextmenu", this.onContextmenu);
	this.element.observe("focus", this.onFocus);
	this.element.observe("blur", this.onBlur);
	
	// extend DOM element
	Object.extend(this.element, {
		getActivator: function() {
			return this.activator;
		},
		setSelected: function(isSelected) {
			this.activator.setSelected(isSelected);
		},
		isSelected: function() {
			return this.activator.isSelected();
		},
		setEnabled: function(isEnabled) {
			this.activator.setEnabled(isEnabled);
		},
		isEnabled: function() {
			return this.activator.isEnabled();
		}
	});
	
	// cache activator instance in DOM element
	this.element.activator = this;
	
	// initialize instance
	this.handlers = [];
};

Widget.Activator.prototype = {
	// override
	fire: function(eventName) {
		return this.superclass.fire(eventName, this.element);
	},
	
	setSelected: function(isSelected) {
		isSelected = (isSelected == null) ? true : isSelected;
		this.selected = isSelected;
		if (isSelected) {
			this.element.addClassName(this.get("selectedClassName"));
		} else {
			this.element.removeClassName(this.get("selectedClassName"));
		}
	},
	isSelected: function() {
		return this.element.hasClassName(this.get("selectedClassName"));
	},
	
	setEnabled: function(isEnabled) {
		isEnabled = (isEnabled == null) ? true : isEnabled;
		this.enabled = isEnabled;
		if (isEnabled) {
			this.element.removeClassName(this.get("disabledClassName"));
		} else {
			this.element.addClassName(this.get("disabledClassName"));
		}
	},
	isEnabled: function() {
		return !this.element.hasClassName(this.get("disabledClassName"));
	},
	
	destroy: function() {
		this.superclass.destroy();
		
		// stop observing DOM events
		this.element.stopObserving("mouseover", this.onMouseover);
		this.element.stopObserving("mouseout", this.onMouseout);
		this.element.stopObserving("mousedown", this.onMousedown);
		this.element.stopObserving("mouseup", this.onMouseup);
		this.element.stopObserving("click", this.onClick);
		//this.element.stopObserving("dblclick", this.onDblClick);
		this.element.stopObserving("contextmenu", this.onContextmenu);
		this.element.stopObserving("focus", this.onFocus);
		this.element.stopObserving("blur", this.onBlur);
		
		// remove DOM element extensions
		delete this.element["getActivator"];
		delete this.element["setSelected"];
		delete this.element["isSelected"];
		delete this.element["setEnabled"];
		delete this.element["isEnabled"];
		
		// remove class names
		if (this.get("className")) {
			this.element.removeClassName(this.get("className"));
		}
		this.element.removeClassName(this.get("hoverClassName"));
		this.element.removeClassName(this.get("activeClassName"));
		this.element.removeClassName(this.get("selectedClassName"));
		this.element.removeClassName(this.get("disabledClassName"));
		
		// delete instance cached in DOM element
		delete this.element["activator"];
	},
	
	/** handlers **/
	onMouseover: function(e) {
		if (this.isEnabled()) {
			this.element.addClassName(this.get("hoverClassName"));
			this.fire("mouseover");
		}
	},
	onMouseout: function(e) {
		this.element.removeClassName(this.get("hoverClassName"));
		this.element.removeClassName(this.get("activeClassName"));
		if (this.isEnabled()) {
			this.fire("mouseout");
		}
	},
	onMousedown: function(e) {
		if (this.isEnabled()) {
			this.element.addClassName(this.get("activeClassName"));
			this.fire("mousedown");
		}
	},
	onMouseup: function(e) {
		this.element.removeClassName(this.get("activeClassName"));
		if (this.isEnabled()) {
			this.fire("mouseup");
		}
	},
	onClick: function(e) {
		if (this.isEnabled()) {
			this.fire("click");
		}
		
		// handle double-click
		if (e.detail > 1) { // e.isDoubleClick()
			this.onDblClick(e);
		}
	},
	onDblClick: function(e) {
		if (this.isEnabled()) {
			this.fire("dblclick");
		}
	},
	onContextmenu: function(e) {
		if (this.isEnabled()) {
			this.fire("contextmenu");
		}
	},
	onFocus: function(e) {
		if (this.isEnabled()) {
			this.element.addClassName(this.get("focusClassName"));
			this.fire("focus");
		}
	},
	onBlur: function(e) {
		this.element.removeClassName(this.get("focusClassName"));
		if (this.isEnabled()) {
			this.fire("blur");
		}
	}
};

Object.inherit(Widget.Activator, Widget);