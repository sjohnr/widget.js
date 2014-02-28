Widget.Menu = function(element, options) {
	element = $(element) || this.create(element);
	this.super(element, Object.extend({
		pageOffset: 25,
		separatorClassName: "separator",
		items: [],
	}, options || {}));
	
	// cache menu (this) in DOM element
	this.element.menu = this;
	
	// add items to menu (from js)
	this.get("items").each(this.addItem, this);
	
	// create submenus (from html)
	this.element.getElementsBySelector(".menu").each(this.createSubMenu, this);
	
	// initialize
	this.bind($w("onDocumentClick onMenuClick onMenuMouseover onMenuMouseout"));
	this.observe("click", this.onMenuClick);
	this.observe("mouseover", this.onMenuMouseover);
	this.observe("mouseout", this.onMenuMouseout);
	document.observe("click", this.onDocumentClick);
};
Widget.Menu.prototype = {
	create: function(elementID) {
		var element = new Element("ul", {id: elementID, className: "menu", style: "display: none;"});
		document.body.appendChild(element);
		
		return element;
	},
	
	show: function(x, y) {
		this.fire("beforeShow");
		
		// set top, left positions
		this.element.setStyle({
			left: x + "px",
			top:  y + "px"
		});
		
		this.element.show();
		this.fire("show");
	},
	hide: function() {
		this.fire("beforeHide");
		this.element.hide();
		this.fire("hide");
	},
	visible: function() {
		return this.element.visible();
	},
	
	click: function(element) {
		this.fire("beforeClick", element);
		element.fire("menu:click", element);
		if (!element.submenu) {
			this.element.hide();
		}
	},
	
	// {label: "abc", className: "abc", separator: false, disabled: false, onClick: function() {...}}
	addItem: function(item) {
		var li = new Element("li"), a = new Element("a", {href: "#", title: item.label}).update(item.label);
		if (item.separator) {
			li.addClassName(this.get("separatorClassName"));
		} else {
			li.appendChild(a);
			li.observe("menu:click", item.onClick);
		}
		if (item.className) {
			li.addClassName(item.className);
		}
		if (item.disabled) {
			li.addClassName(this.get("disabledClassName"));
		}
		if (item.submenu) {
			var menu = new Widget.Menu(li, item.submenu);
			li.submenu = menu;
		}
		
		// add list item
		this.element.appendChild(li);
		this.addElement(li);
	},
	createSubMenu: function(element) {
		var menu = new Widget.Menu(element);
		element.up().submenu = menu;
		element.hide();
		
		return menu;
	},
	
	addElement: function(element) {
		if (element.hasClassName(this.get("separatorClassName"))) {
			return;
		}
		this.superclass.addElement(element);
	},
	
	register: function(index, handler) {
		if (Object.isArray(index)) {
			var tmp = index.shift(), menu = this.getElement(tmp).down("ul").menu;
			
			menu.register(index.length > 1 ? index : index[0], handler);
		} else {
			this.getElement(index).observe("menu:click", handler);
		}
	},
	unregister: function(index, handler) {
		if (Object.isArray(index)) {
			var tmp = index.shift(), menu = this.getElement(tmp).down("ul").menu;
			
			menu.unregister(index.length > 1 ? index : index[0], handler);
		} else {
			this.getElement(index).stopObserving("menu:click", handler);
		}
	},
	
	/** handlers **/
	onClick: function(e) {
		this.superclass.onClick(e);
		e.stop();
	},
	onDocumentClick: function(e) {
		if (!e.isRightClick()) {
			this.hide();
		}
	},
	onMenuClick: function(e) {
		var element = this.getElement(e.memo);
		if (element) {
			this.click(element);
		} else {
			this.hide();
		}
		
		//e.stop();
	},
	onMenuMouseover: function(e) {
		var element = this.getElement(e.memo);
		if (element && element.submenu) {
			if (element.timerID) {
				window.clearTimeout(element.timerID);
				delete element.timerID;
			}
			if (!element.submenu.visible()) {
				element.timerID = window.setTimeout(function() {
					var dimensions = document.viewport.getDimensions(), offsets = element.viewportOffset(),
						my = element.getDimensions(), sub = element.submenu.element.getDimensions(),
						x = (offsets.left + my.width + sub.width + this.get("pageOffset") > dimensions.width) ? -my.width : my.width,
						y = (offsets.top + sub.height + this.get("pageOffset") > dimensions.height) ? element.offsetTop + my.height - sub.height : element.offsetTop;
					
					element.submenu.show(x, y);
					delete element.timerID;
				}.bind(this), 300);
			}
		}
	},
	onMenuMouseout: function(e) {
		var element = this.getElement(e.memo);
		if (element && element.submenu) {
			if (element.timerID) {
				window.clearTimeout(element.timerID);
				delete element.timerID;
			}
			element.timerID = window.setTimeout(function() {
				element.submenu.hide();
				delete element.timerID;
			}.bind(this), 300);
		}
	}
};

Object.inherit(Widget.Menu, Widget.Group);