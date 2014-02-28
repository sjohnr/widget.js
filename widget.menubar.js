Widget.MenuBar = function(element, options) {
	this.super(element, options);
	
	this.open = false;
};
Widget.MenuBar.prototype = {
	show: function() {
		this.fire("beforeShow");
		this.element.show();
		this.fire("show");
	},
	click: function(element) {
		this.fire("beforeClick", element);
		var dimensions = document.viewport.getDimensions(), offsets = element.viewportOffset(),
			my = element.getDimensions(), sub = element.submenu.element.getDimensions(),
			x = (offsets.left + sub.width + this.get("pageOffset") > dimensions.width) ? element.offsetLeft + my.width - sub.width : element.offsetLeft,
			y = (offsets.top + my.height + sub.height + this.get("pageOffset") > dimensions.height) ? -sub.height : my.height;
		
		element.submenu.show(x, y);
		element.fire("menu:click");
	},
	
	/** overridden handlers **/
	onDocumentClick: function(e) {
		this.open = false;
	},
	onMenuClick: function(e) {
		var element = this.getElement(e.memo);
		if (this.open && element && element.submenu) {
			this.open = false;
			element.submenu.hide();
		} else if (!this.open && element && element.submenu) {
			this.open = true;
			this.click(element);
		} else if (!e.memo.submenu) {
			this.open = false;
		}
	},
	onMenuMouseover: function(e) {
		var element = this.getElement(e.memo);
		if (this.open && element && element.submenu) {
			if (element.timerID) {
				window.clearTimeout(element.timerID);
				element.timerID = null;
			}
			
			if (!element.submenu.visible()) {
				element.timerID = window.setTimeout(function() {
					this.click(element);
				}.bind(this), 0);
			}
		}
	},
	onMenuMouseout: function(e) {
		var element = e.memo;
		if (this.open && element.submenu) {
			var submenu = element.submenu;
			if (element.timerID) {
				window.clearTimeout(element.timerID);
				element.timerID = null;
			}
			element.timerID = window.setTimeout(function() {
				submenu.hide();
				element.timerID = null;
			}.bind(this), 0);
			e.stop();
		}
	}
};

Object.inherit(Widget.MenuBar, Widget.Menu);
