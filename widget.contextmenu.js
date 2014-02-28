Widget.ContextMenu = function(element, options) {
	this.super(element, Object.extend({
		selector: ".contextmenu"
	}, options || {}));
	
	// initialize
	this.bind($w("onDefaultClick onRightClick"));
	$$(this.get("selector")).invoke("observe", "contextmenu", this.onRightClick);
	
	// target of right-click event
	this.target = null;
};
Widget.ContextMenu.prototype = {
	// for double-click tables only
	getTargetID: function(e, tableID) { // HACK
		var element = this.target, table = element.up("table").table, rowID = table.getSelectedRowID();
		
		return rowID;
	},
	
	/** handlers **/
	onDefaultClick: function(e) {
		// double click from table, capture target
		this.target = e.element();
	},
	
	onRightClick: function(e) {
		var pointer = e.pointer(), x = pointer.x, y = pointer.y;
		var dimensions = document.viewport.getDimensions(), offsets = document.viewport.getScrollOffsets(), my = this.element.getDimensions();
		
		x = (x + my.width + this.get("pageOffset") > dimensions.width) ? x - my.width : x;
		y = (y - offsets.top + my.height + this.get("pageOffset") > dimensions.height) ? y - my.height : y;
		
		this.target = e.currentTarget;
		this.show(x, y);
		//e.stop();
	}
};

Object.inherit(Widget.ContextMenu, Widget.Menu);
