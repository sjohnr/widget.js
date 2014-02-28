Widget.Group = function(element, options) {
	this.super(element, Object.extend({
		className: null,
		hoverClassName: "hover",
		activeClassName: "active",
		selectedClassName: "selected",
		focusClassName: "focus",
		disabledClassName: "disabled",
		singleSelect: false
	}, options || {}));
	
	// add event handlers to instance
	this.bind($w("onMouseover onMouseout onMousedown onMouseup onClick onDblClick onContextmenu onFocus onBlur"));
	
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
	
	this.recent = null;
	this.elements = [];
	this.element.childElements().each(this.addElement, this);
};

Widget.Group.prototype = {
	addElement: function(element) {
		// add base class name
		if (this.get("className")) {
			element.addClassName(this.get("className"));
		}
		
		// extend DOM element
		Object.extend(element, {
			getActivator: function() {
				return this.activator;
			},
			setSelected: function(isSelected) {
				this.activator.setSelected(this, isSelected);
			},
			isSelected: function() {
				return this.activator.isSelected(this);
			},
			setEnabled: function(isEnabled) {
				this.activator.setEnabled(this, isEnabled);
			},
			isEnabled: function() {
				return this.activator.isEnabled(this);
			}
		});
		
		// cache activator instance in DOM element
		element.activator = this;
		
		// memorize DOM element
		this.elements.push(element);
	},
	removeElement: function(element) {
		// remove DOM element extensions
		delete element["getActivator"];
		delete element["setSelected"];
		delete element["isSelected"];
		delete element["setEnabled"];
		delete element["isEnabled"];
		
		// remove class names
		if (this.get("className")) {
			element.removeClassName(this.get("className"));
		}
		element.removeClassName(this.get("hoverClassName"));
		element.removeClassName(this.get("activeClassName"));
		element.removeClassName(this.get("selectedClassName"));
		element.removeClassName(this.get("disabledClassName"));
		
		// delete instance cached in DOM element
		delete element["activator"];
		
		// remove reference
		this.elements = this.elements.without(element);
	},
	removeElements: function() {
		this.elements.each(function(element) {
			this.removeElement(element);
		}, this);
	},
	
	find: function(element) {
		// base case: recursion trickled down with no success
		if (!element || element == this.element || element == document.body) {
			return null;
		}
		
		return this.getIndex(element) >= 0 ? element : this.find(element.up());
	},
	
	getElement: function(index) {
		return Object.isNumber(index) ? this.elements[index] : this.getIndex(index) >= 0 ? index : null;
	},
	getElements: function() {
		return this.elements;
	},
	getIndex: function(element) {
		return this.elements.indexOf(element);
	},
	
	setSelected: function(index, isSelected) {
		isSelected = (isSelected == null) ? true : isSelected;
		
		var element = this.getElement(index);
		if (isSelected && this.get("singleSelect")) {
			this.selectAll(false);
		}
		if (isSelected) {
			element.addClassName(this.get("selectedClassName"));
		} else {
			element.removeClassName(this.get("selectedClassName"));
		}
	},
	getSelected: function() {
		var elements = [];
		this.elements.each(function(element) {
			if (element.hasClassName(this.get("selectedClassName"))) {
				elements.push(element);
			}
		}, this);
		
		return elements;
	},
	isSelected: function(index) {
		return this.getElement(index).hasClassName(this.get("selectedClassName"));
	},
	
	setRecentElement: function(element) {
		this.recent = this.getIndex(element);
	},
	getRecentElement: function() {
		return this.getElement(this.recent);
	},
	
	setEnabled: function(index, isEnabled) {
		isEnabled = (isEnabled == null) ? true : isEnabled;
		
		var element = this.getElement(index);
		if (isEnabled) {
			element.removeClassName(this.get("disabledClassName"));
		} else {
			element.addClassName(this.get("disabledClassName"));
		}
	},
	getEnabled: function() {
		var elements = [];
		this.elements.each(function(element) {
			if (!element.hasClassName(this.get("disabledClassName"))) {
				elements.push(element);
			}
		}, this);
		
		return elements;
	},
	isEnabled: function(index) {
		return !this.getElement(index).hasClassName(this.get("disabledClassName"));
	},
	
	selectAll: function(isSelected) {
		this.elements.each(function(element, index) {
			if (isSelected) {
				element.addClassName(this.get("selectedClassName"));
			} else {
				element.removeClassName(this.get("selectedClassName"));
			}
		}, this);
	},
	enableAll: function(isEnabled) {
		this.elements.each(function(element, index) {
			if (isEnabled) {
				element.removeClassName(this.get("disabledClassName"));
			} else {
				element.addClassName(this.get("disabledClassName"));
			}
		}, this);
	},
	
	destroy: function() {
		this.superclass.destroy();
		
		// remove DOM elements
		this.elements.each(function(element) {
			this.removeElement(element);
		}, this);
		
		// stop observing custom events
		this.handlers.each(function(h) {
			this.stopObserving(h.name, h.handler);
		}, this);
		
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
		
		// reset instance
		this.elements.length = 0;
		this.handlers.length = 0;
	},
	
	/** handlers **/
	onMouseover: function(e) {
		var element = this.find(e.element());
		if (element && this.isEnabled(element)) {
			//this.setRecentElement(element);
			element.addClassName(this.get("hoverClassName"));
			this.fire("mouseover", element);
		}
	},
	onMouseout: function(e) {
		var element = this.find(e.element());
		if (element) {
			element.removeClassName(this.get("hoverClassName"));
			element.removeClassName(this.get("activeClassName"));
		}
		if (element && this.isEnabled(element)) {
			//this.setRecentElement(element);
			this.fire("mouseout", element);
		}
	},
	onMousedown: function(e) {
		var element = this.find(e.element());
		if (element && this.isEnabled(element)) {
			//this.setRecentElement(element);
			element.addClassName(this.get("activeClassName"));
			this.fire("mousedown", element);
		}
	},
	onMouseup: function(e) {
		var element = this.find(e.element());
		if (element) {
			element.removeClassName(this.get("activeClassName"));
		}
		if (element && this.isEnabled(element)) {
			//this.setRecentElement(element);
			this.fire("mouseup", element);
		}
	},
	onClick: function(e) {
		var element = this.find(e.element());
		if (element && this.isEnabled(element)) {
			this.setRecentElement(element);
			this.fire("click", element);
		}
		
		// handle double-click
		if (e.detail > 1) { // e.isDoubleClick()
			this.onDblClick(e);
		}
	},
	onDblClick: function(e) {
		var element = this.find(e.element());
		if (element && this.isEnabled(element)) {
			this.setRecentElement(element);
			this.fire("dblclick", element);
		}
	},
	onContextmenu: function(e) {
		var element = this.find(e.element());
		if (element && this.isEnabled(element)) {
			this.setRecentElement(element);
			this.fire("contextmenu", element);
		}
	},
	onFocus: function(e) {
		var element = this.find(e.element());
		if (element && this.isEnabled(element)) {
			//this.setRecentElement(element);
			element.addClassName(this.get("focusClassName"));
			this.fire("focus", element);
		}
	},
	onBlur: function(e) {
		var element = this.find(e.element());
		if (element) {
			element.removeClassName(this.get("focusClassName"));
		}
		if (element && this.isEnabled(element)) {
			//this.setRecentElement(element);
			this.fire("blur", element);
		}
	}
};

Object.inherit(Widget.Group, Widget);