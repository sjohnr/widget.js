// create Widget namespace
if (typeof Widget == "undefined") {
	Widget = {};
}

(function() {

/**
 * The mouseover event handler
 * @param e
 * @private
 */
function mouseover(e) {
	var element = this.find(e.element());
	if (element != null && this.isEnabled(element)) {
		element.addClassName(this.options.classNames.hover);
		this.fire(this.options.events.mouseover, element, e);
	}
}

/**
 * The mouseout event handler
 * @param e
 * @private
 */
function mouseout(e) {
	var element = this.find(e.element());
	if (element != null) {
		element.removeClassName(this.options.classNames.hover);
		element.removeClassName(this.options.classNames.active);
		if (this.isEnabled(element)) {
			this.fire(this.options.events.mouseout, element, e);
		}
	}
}

/**
 * The mousedown event handler
 * @param e
 * @private
 */
function mousedown(e) {
	var element = this.find(e.element());
	if (element != null && this.isEnabled(element)) {
		element.addClassName(this.options.classNames.active);
		this.fire(this.options.events.mousedown, element, e);
	}
}

/**
 * The mouseup event handler
 * @param e
 * @private
 */
function mouseup(e) {
	var element = this.find(e.element());
	if (element != null) {
		element.removeClassName(this.options.classNames.active);
		if (this.isEnabled(element)) {
			this.fire(this.options.events.mouseup, element, e);
		}
	}
}

/**
 * The focus event handler
 * @param e
 * @private
 */
function focus(e) {
	var element = this.find(e.element());
	if (element != null && this.isEnabled(element)) {
		element.addClassName(this.options.classNames.focus);
		this.fire(this.options.events.focus, element, e);
	}
}

/**
 * The blur event handler
 * @param e
 * @private
 */
function blur(e) {
	var element = this.find(e.element());
	if (element != null) {
		element.removeClassName(this.options.classNames.focus);
		if (this.isEnabled(element)) {
			this.fire(this.options.events.blur, element, e);
		}
	}
}

/**
 * The click event handler
 * @param e
 * @private
 */
function click(e) {
	// handle double-click
	if (e.detail > 1) { // or e.isDoubleClick()
		dblclick.call(this, e);
	}
	
	var element = this.find(e.element());
	if (element != null && this.isEnabled(element)) {
		this.fire(this.options.events.click, element, e);
	}
}

/**
 * The dblclick event handler
 * @param e
 * @private
 */
function dblclick(e) {
	var element = this.find(e.element());
	if (element != null && this.isEnabled(element)) {
		this.fire(this.options.events.dblclick, element, e);
	}
}

/**
 * Construct a Widget.Activator object.
 * @param options
 * @constructor Widget.Activator
 */
Widget.Activator = function(options) {
	// initialize the activator
	this.elements = [];
	this.handlers = [];
	this.options = Object.extend({
		container:      null,
		target:         null,
		selector:       null,
		elements:       null,
		singleSelect:   false,
		extendElements: false,
		classNames:     null,
		events:         null,
	}, options || {});
	this.eventHandlers = {
		mouseover: mouseover.bindAsEventListener(this),
		mouseout:  mouseout .bindAsEventListener(this),
		mouseup:   mouseup  .bindAsEventListener(this),
		mousedown: mousedown.bindAsEventListener(this),
		focus:     focus    .bindAsEventListener(this),
		blur:      blur     .bindAsEventListener(this),
		click:     click    .bindAsEventListener(this),
		dblclick:  dblclick .bindAsEventListener(this),
	};
	
	// default className option
	this.options.classNames = Object.extend({
		normal:   null,
		hover:    "hover",
		active:   "active",
		selected: "selected",
		focus:    "focus",
		disabled: "disabled",
	}, this.options.classNames || {});
	
	// default event option
	this.options.events = Object.extend({
		mouseover: "activator:mouseover",
		mouseout:  "activator:mouseout",
		mousedown: "activator:mousedown",
		mouseup:   "activator:mouseup",
		focus:     "activator:focus",
		blur:      "activator:blur",
		click:     "activator:click",
		dblclick:  "activator:dblclick",
	}, this.options.events || {});
	
	// attach handlers to container
	if (this.options.container != null) {
		this.container = $(this.options.container);
		this.container.observe("mouseover", this.eventHandlers.mouseover);
		this.container.observe("mouseout",  this.eventHandlers.mouseout);
		this.container.observe("mousedown", this.eventHandlers.mousedown);
		this.container.observe("mouseup",   this.eventHandlers.mouseup);
		this.container.observe("click",     this.eventHandlers.click);
//		this.container.observe("focus",     this.eventHandlers.focus);
//		this.container.observe("blur",      this.eventHandlers.blur);
	} else {
		this.container = null;
	}
	
	// use target for non-container activator events
	if (this.options.target != null) {
		this.target = $(this.options.target);
	} else {
		this.target = null;
	}
	
	// add elements using selector or elements options
	var elements = null;
	if (this.options.selector != null) {
		if (this.container != null) {
			elements = this.container.getElementsBySelector(this.options.selector);
		} else {
			elements = $$(this.options.selector);
		}
	} else if (this.options.elements != null) {
		elements = this.options.elements;
	}
	
	// add elements to the activator
	if (elements != null) {
		this.addAll(elements);
	}
};

/**
 * Class methods for Widget.Activator.
 * @prototype Widget.Activator
 */
Widget.Activator.prototype = {
	/**
	 * Add an element to the activator.
	 * @param element
	 */
	add: function(element) {
		element = $(element);
		
		// add default className
		if (this.options.classNames.normal != null) {
			element.addClassName(this.options.classNames.normal);
		}
		
		// observe events (if no container)
		if (this.container == null) {
			element.observe("mouseover", this.eventHandlers.mouseover);
			element.observe("mouseout",  this.eventHandlers.mouseout);
			element.observe("mousedown", this.eventHandlers.mousedown);
			element.observe("mouseup",   this.eventHandlers.mouseup);
			element.observe("click",     this.eventHandlers.click);
		}
		
		// always observe these events on individual element
		element.observe("focus", this.eventHandlers.focus);
		element.observe("blur",  this.eventHandlers.blur);
		
		// extend element
		if (this.options.extendElements) {
			Object.extend(element, {
				getActivator: function() {
					return this.activator;
				},
				isSelected: function() {
					return this.activator.isSelected(this);
				},
				select: function() {
					this.activator.select(this);
				},
				deselect: function() {
					this.activator.deselect(this);
				},
				isEnabled: function() {
					return this.activator.isEnabled(this);
				},
				enable: function() {
					this.activator.enable(this);
				},
				disable: function() {
					this.activator.disable(this);
				},
			});
		}
		
		// cache activator instance in DOM element
		element.activator = this;
		this.elements.push(element);
	},
	/**
	 * Remove an element from the activator.
	 * @param element
	 */
	remove: function(element) {
		element = this.find(element);
		if (element == null) {
			return;
		}
		
		// remove DOM element extensions
		delete element["activator"];
		if (this.options.extendElements) {
			delete element["getActivator"];
			delete element["setSelected"];
			delete element["isSelected"];
			delete element["setEnabled"];
			delete element["isEnabled"];
		}
		
		// remove default className
		if (this.options.classNames.normal != null) {
			element.removeClassName(this.options.classNames.normal);
		}
		
		// remove classNames
		element.removeClassName(this.options.classNames.hover);
		element.removeClassName(this.options.classNames.active);
		element.removeClassName(this.options.classNames.selected);
		element.removeClassName(this.options.classNames.disabled);
		element.removeClassName(this.options.classNames.focus);
		
		// observe events (if no container)
		if (this.container == null) {
			element.stopObserving("mouseover", this.mouseover);
			element.stopObserving("mouseout",  this.mouseout);
			element.stopObserving("mousedown", this.mousedown);
			element.stopObserving("mouseup",   this.mouseup);
			element.stopObserving("click",     this.click);
		}
		
		element.stopObserving("focus",     this.focus);
		element.stopObserving("blur",      this.blur);
		
		// remove reference to this element
		this.elements = this.elements.without(element);
	},
	/**
	 * Add all elements to the activator.
	 * @param elements
	 */
	addAll: function(elements) {
		elements.each(this.add, this);
	},
	/**
	 * Remove all elements from the activator.
	 * @param elements
	 */
	removeAll: function(elements) {
		elements.each(this.remove, this);
	},
	/**
	 * Reset the state of the activator with the given elements.
	 * @param elements
	 */
	apply: function(elements) {
		var selectedElements = this.getSelectedElements();
		var disabledElements = this.getDisabledElements();
		this.removeAll(this.elements);
		this.addAll(elements);
		selectedElements.each(this.select, this);
		disabledElements.each(this.disable, this);
	},
	/**
	 * Destroy the activator; remove all event handlers,
	 * and clean up extended elements.
	 */
	destroy: function() {
		this.elements.each(this.remove, this);
		this.handlers.each(function(h) {
			this.stopObserving(h.eventName, h.handler);
		}, this);
		this.elements.length = 0;
		this.handlers.length = 0;
		if (this.container != null) {
			//$w("mouseover mouseout mousedown mouseup click focus blur").each(function(key) { this.container.stopObserving(key, this.eventHandlers[key]); }, this);
			this.container.stopObserving("mouseover", this.eventHandlers.mouseover);
			this.container.stopObserving("mouseout",  this.eventHandlers.mouseout);
			this.container.stopObserving("mousedown", this.eventHandlers.mousedown);
			this.container.stopObserving("mouseup",   this.eventHandlers.mouseup);
			this.container.stopObserving("click",     this.eventHandlers.click);
			this.container.stopObserving("focus",     this.eventHandlers.focus);
			this.container.stopObserving("blur",      this.eventHandlers.blur);
		}
	},
	/**
	 * Begin observing a custom activator event.
	 * @param eventName
	 * @param fn
	 */
	observe: function(eventName, fn) {
		this.handlers.push({
			eventName: eventName,
			handler:   fn,
		});
		
		if (this.container != null) {
			this.container.observe(eventName, fn);
		} else if (this.target != null) {
			this.target.observe(eventName, fn);
		} else {
			$(document).observe(eventName, fn);
		}
		
		return this;
	},
	/**
	 * Stop observing a custom activator event.
	 * @param eventName
	 * @param fn
	 */
	stopObserving: function(eventName, fn) {
		if (this.container != null) {
			this.container.stopObserving(eventName, fn);
		} else if (this.target != null) {
			this.target.stopObserving(eventName, fn);
		} else {
			$(document).stopObserving(eventName, fn);
		}
		
		return this;
	},
	/**
	 * Fires an activator event.
	 * @param eventName
	 * @param element
	 * @param e
	 * @private
	 */
	fire: function(eventName, element, e) {
		var memo = {
			activator: this,
			element:   element,
			event:     e
		};
		
		if (this.container != null) {
			this.container.fire(eventName, memo);
		} else if (this.target != null) {
			this.target.fire(eventName, memo);
		} else {
			$(document).fire(eventName, memo);
		}
		
		return this;
	},
	/**
	 * Find the element at or above the given DOM node that is a member of the
	 * activator's list of elements.
	 * @param element
	 * @return boolean
	 */
	find: function(element) {
		// base case: recursion bubbled up with no success
		if (element == null || element == this.element || element == document.body) {
			return null;
		}
		
		return this.elements.indexOf(element) >= 0 ? element : this.find(element.up());
	},
	/**
	 * Retrieve an element by index.
	 * @param index
	 * @return object
	 */
	elementAt: function(index) {
		return this.elements[index];
	},
	/**
	 * Retrieve the index of an element.
	 * @param element
	 * @return int
	 */
	indexOf: function(element) {
		return this.elements.indexOf(element);
	},
	/**
	 * Determine if a given element resides within the activator.
	 * @Param element
	 * @return boolean
	 */
	contains: function(element) {
		return this.elements.indexOf(element) >= 0;
	},
	/**
	 * Determines if an element is enabled.
	 * @param element
	 * @return boolean
	 */
	isEnabled: function(element) {
		return !element.hasClassName(this.options.classNames.disabled);
	},
	/**
	 * Set an element enabled.
	 * @param element
	 */
	enable: function(element) {
		if (element != null) {
			element.removeClassName(this.options.classNames.disabled);
		}
	},
	/**
	 * Set an element disabled.
	 * @param element
	 */
	disable: function(element) {
		if (element != null) {
			element.addClassName(this.options.classNames.disabled);
		}
	},
	/**
	 * Set all elements enabled.
	 */
	enableAll: function() {
		this.elements.each(this.enable, this);
	},
	/**
	 * Set all elements disabled.
	 */
	disableAll: function() {
		this.elements.each(this.disable, this);
	},
	/**
	 * Retrieve an array of disabled elements for this activator.
	 */
	getDisabledElements: function() {
		return this.elements.reject(this.isEnabled, this);
	},
	/**
	 * Determines if an element is selected.
	 * @param element
	 * @return boolean
	 */
	isSelected: function(element) {
		return element.hasClassName(this.options.classNames.selected);
	},
	/**
	 * Set an element selected.
	 * @param element
	 */
	select: function(element) {
		if (element != null) {
			if (this.options.singleSelect) {
				this.deselectAll();
			}
			
			element.addClassName(this.options.classNames.selected);
		}
	},
	/**
	 * Set an element deselected.
	 * @param element
	 */
	deselect: function(element) {
		if (element != null) {
			element.removeClassName(this.options.classNames.selected);
		}
	},
	/**
	 * Set all elements selected.
	 */
	selectAll: function() {
		this.elements.each(this.select, this);
	},
	/**
	 * Set all elements deselected.
	 */
	deselectAll: function() {
		this.elements.each(this.deselect, this);
	},
	/**
	 * Retrieve an array of selected elements for this activator.
	 */
	getSelectedElements: function() {
		return this.elements.findAll(this.isSelected, this);
	},
};

// Widget.Activator constants
Object.extend(Widget.Activator, {
	MOUSEOVER: "activator:mouseover",
	MOUSEOUT:  "activator:mouseout",
	MOUSEUP:   "activator:mouseup",
	MOUSEDOWN: "activator:mousedown",
	FOCUS:     "activator:focus",
	BLUR:      "activator:blur",
	CLICK:     "activator:click",
	DBLCLICK:  "activator:dblclick",
});

})();
