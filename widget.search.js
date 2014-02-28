Widget.Search = function(element) {
	this.super(element);
	
	function findTable(element) {
		var table = null;
		while (!table) {
			element = element.up();
			table = element.down("table");
		}
		
		return table;
	}
	
	this.table = findTable(this.element).table;
	// update the filters array to include a new dynamic filter
	this.table.getDataSource().getFilters().push(this.filter.bind(this));
	
	this.element.search = this;
	
	this.bind($w("onKeyup"));
	this.element.observe("keyup", this.onKeyup);
	this.timeoutID = null;
};

Widget.Search.prototype = (function() {
	function cmp(a, b) {
		return (new RegExp(b.replace(/%/g, "(.*)"), "i")).test(a);
	}
	
	return {
		filter: function(row) {
			var result = false, value = "%"+this.element.value+"%";
			
			// perform an OR of all columns
			for (var key in row) {
				if (cmp(row[key], value)) {
					result = true;
					break;
				}
			}
			
			return result;
		},
		
		/** handlers **/
		onKeyup: function(e) {
			var keyCode = e.keyCode;
			if ((31 < keyCode && keyCode < 127) || keyCode == Event.KEY_BACKSPACE || keyCode == Event.KEY_DELETE) {
				if (this.timeoutID) {
					window.clearTimeout(this.timeoutID);
					this.timeoutID = null;
				}
				
				this.timeoutID = window.setTimeout(function() {
					this.table.refresh();
					this.timeoutID = null;
				}.bind(this), 400);
			}
		}
	};
})();

Object.inherit(Widget.Search, Widget);
