Widget.Matrix = function(element, datasource) {
	this.super(element);
	
	this.element.matrix = this;
	// add event handlers to instance
	this.bind($w("onRowClick"));
	
	// create an activator to handle row selection and highlighting
	var rowActivator = new Widget.RadioGroup(this.element);
	rowActivator.observe("activeElementChange", this.onRowClick.bindAsEventListener(this));
	
	// initialize
	this.rowActivator = rowActivator;
	this.datasource = datasource;
	this.index = [];
};

Widget.Matrix.prototype = {
	/**
	 * Render the data inside the matrix dom element.
	 *
	 * @public
	 */
	render: function() {
		var data = this.datasource.getData();
		var elements = this.rowActivator.getElements();
		//var children = this.element.childElements();
		
		// clear parent
		this.element.innerHTML = "";
		
		// create/update and append rows
		data.each(function(row, index) {
			var rowID = row.rowID, i = this.index.indexOf(rowID), element = elements[i];
			if (Object.isUndefined(element)) {
				element = this.createRow(row);
				this.rowActivator.addElement(element);
				this.index.push(rowID);
				element.rowID = rowID;
			} else {
				element = this.updateRow(row, element);
			}
			
			// append row
			this.element.appendChild(element);
			
			// add odd/even class name, alternating rows
			$w("even odd").each(element.removeClassName, element);
			element.addClassName(index % 2 == 1 ? "even" : "odd");
		}, this);
	},
	
	/**
	 * Refresh the data, and render the matrix.
	 *
	 * @public
	 */
	refresh: function() {
		this.render();
	},
	
	/**
	 * @abstract
	 */
	createRow: function(row) {
		throw new Exception("Abstract createRow! Please implement.");
	},
	
	/**
	 * @abstract
	 */
	updateRow: function(row, element) {
		throw new Exception("Abstract updateRow! Please implement.");
	},
	
	/**
	 * Get datasource 
	 *
	 * @public
	 */
	getDataSource: function() {
		return this.datasource;
	},
	
	/**
	 * Get the row at the given index.
	 *
	 * @param index the row index (0 .. n-1)
	 * @public
	 */
	getRow: function(index) {
		return this.rowActivator.getElement(index);
	},
	
	/**
	 * Get the curently selected row, or null.
	 *
	 * @public
	 */
	getSelectedRow: function() {
		var selected = this.rowActivator.getSelected();
		
		return (selected.length > 0) ? selected[0] : null;
	},
	
	/**
	 * Get the rowID attribute from the currently selected row.
	 *
	 * @public
	 */
	getSelectedRowID: function() {
		var row = this.getSelectedRow();
		
		return row ? row.rowID : null; // HACK
	},
	
	/**
	 * Get the recently manipulated row.
	 *
	 * @public
	 */
	getRecentRow: function() {
		return this.rowActivator.getRecentElement();
	},
	
	/**
	 * Get the rowID attribute from the recently manipulated row.
	 *
	 * @public
	 */
	getRecentRowID: function() {
		var row = this.getRecentRow();
		
		return row ? row.rowID : null; // HACK
	},
	
	/** handlers **/
	onRowClick: function(e) {
		
	}
};

Object.inherit(Widget.Matrix, Widget);
