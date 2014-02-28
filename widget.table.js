Widget.Table = function(element, datasource) {
	this.super(element);
	
	// cache table (this) in DOM element
	this.element.table = this;
	
	// gather top level nodes
	var thead = this.element.down("thead");
	var tbody = this.element.down("tbody.data");
	var tbody2 = this.element.down("tbody.default");
	
	// parse column definitions from th classNames
	var cols = $A(thead.getElementsByTagName("th")).pluck("className");
	
	// create an activator to handle column headers and sorting
	var headerActivator = new Widget.RadioGroup(thead.down("tr"));
	headerActivator.observe("activeElementChange", this.onHeaderClick.bindAsEventListener(this));
	
	// create an activator to handle row selection and highlighting
	var rowActivator = new Widget.RadioGroup(tbody);
	
	// initialize
	this.thead = thead;
	this.tbody = tbody;
	this.tbody2 = tbody2;
	this.cols = cols;
	this.datasource = datasource;
	this.cache = datasource.getData();
	
	this.headerActivator = headerActivator;
	this.rowActivator = rowActivator;
	
	this.isCached = true;
	this.index = [];
	this.cur = null;
	this.order = "asc";
};

Widget.Table.prototype = {
	/**
	 * Render the data inside the table dom element.
	 *
	 * @public
	 */
	render: function() {
		var data = this.cache;
		var elements = this.rowActivator.getElements();
		//var trs = this.tbody.childElements();
		//var tableID = getTableID(data); // HACK
		
		// clear tbody and display
		this.tbody.innerHTML = "";
		switch (true) {
			case (data.length > 0):
				this.tbody2.hide(); this.tbody.show(); break;
			default:
				this.tbody2.show(); this.tbody.hide(); break;
		}
		
		// create/update and append rows
		data.each(function(row, index) {
			var rowID = row.rowID, i = this.index.indexOf(rowID), tr = elements[i];
			if (Object.isUndefined(tr)) {
				tr = this.createRow(row);
				this.rowActivator.addElement(tr);
				this.index.push(rowID);
				tr.rowID = rowID;
			} else if (!this.isCached) {
				tr = this.updateRow(row, tr);
			}
			
			// append row
			this.tbody.appendChild(tr);
			
			// add odd/even class name, alternating rows
			$w("even odd").each(tr.removeClassName, tr);
			tr.addClassName(index % 2 == 1 ? "even" : "odd");
		}, this);
		
		// flag table as cached (for sorting only)
		this.isCached = true;
	},
	
	/**
	 * Defer rendering the table by a specified timeout.
	 *
	 * @public
	 */
	defer: function(timeout) {
		return window.setTimeout(this.render.bind(this), timeout || 0); // or this.render.defer()
	},
	
	/**
	 * Refresh the data, and render the table.
	 *
	 * @public
	 */
	refresh: function() {
		// update cache
		var data = this.datasource.getData();
		this.cache = (this.cur != null) ? this.sort(data, this.cur) : this.datasource.getData(); // grab fresh data
		this.isCached = false; // force refresh
		
		this.render();
	},
	
	/**
	 * Programmatically sort a column without rendering table.
	 *
	 * @param index the column index (0 .. m-1)
	 * @param order "asc" or "desc"; defaults to "asc"
	 *
	 * @public
	 */
	sortColumn: function(index, order) {
		// default order
		order = order || (this.cur == index && this.order == "asc" ? "desc" : "asc")
		
		// "asc" and "desc" class names
		var e1 = this.headerActivator.getElement(index), e2 = this.headerActivator.getElement(this.cur);
		$w("asc desc").each(e1.removeClassName, e1);
		if (e2) {
			$w("asc desc").each(e2.removeClassName, e2);
		}
		e1.addClassName(order); // add class name
		
		// update sort order
		this.order = order;
		this.cur = index;
		this.headerActivator.setSelected(index); // update activator
		
		// sort and cache data
		this.cache = this.sort(this.cache || this.datasource.getData(), index);
	},
	
	/**
	 * Create a tr element with a row of data.
	 *
	 * @public
	 */
	createRow: function(row) {
		// create row element
		var tr = new Element("tr"), formatted = row.formatted || {};
		
		// create and append cells
		this.cols.each(function(col) {
			var td = new Element("td");
			td.innerHTML = formatted[col] || row[col];
			
			tr.appendChild(td);
		});
		
		return tr;
	},
	
	/**
	 * Update an existing tr element with a row of data.
	 *
	 * @public
	 */
	updateRow: function(row, tr) {
		tr = tr || new Element("tr");
		var tds = tr.childElements(), formatted = row.formatted || {};
		
		// update existing cells
		this.cols.each(function(col, index) {
			var td = tds[index];
			if (formatted[col] && td.innerHTML != formatted[col]) {
				td.innerHTML = formatted[col];
			} else if (!formatted[col] && td.innerHTML != row[col]) {
				td.innerHTML = row[col];
			}
		});
		
		return tr;
	},

	/**
	 * Sort the data using a given column.
	 *
	 * @public
	 */
	sort: function(data, index) {
		var col = this.cols[index], m = (this.order == "asc") ? 1 : -1;
		
		// sort the data
		data = data.sort(function(a, b) {
			return this.cmp(a, b, col, m);
		}.bind(this));
		
		return data;
	},
	
	/**
	 * Compare two rows of data on the given column, and order asc/desc.
	 *
	 * @public
	 */
	cmp: function(a, b, col, m) {
		a = a[col], b = b[col], m = m || 1;
		if (Object.isNumeric(a) && Object.isNumeric(b)) {
			a = Number(a);
			b = Number(b);
		}
		
		return m * ((a < b) ? -1 : (a > b) ? 1 : 0);
	},
	
	/**
	 * Get datasource.
	 *
	 * @public
	 */
	getDataSource: function() {
		return this.datasource;
	},
	
	/**
	 * Set the datasource, therefore changing the entire dataset for the table.
	 *
	 * @public
	 */
	setDataSource: function(datasource) {
		this.datasource = datasource;
	},
	
	/**
	 * Get the row at the given index.
	 *
	 * @param index the row index (0 .. n-1)
	 * @public
	 */
	getRow: function(index) {
		return this.tbody.childElements()[index];
	},
	
	/**
	 * Get the cell at the given row index and column index.
	 *
	 * @param index1 the row index (0 .. n-1)
	 * @param index2 the column index (0 .. m-1)
	 * @public
	 */
	getRowCell: function(index1, index2) {
		return this.getRow(index1).childElements()[index2];
	},
	
	/**
	 * Get the curently selected row.
	 *
	 * @public
	 */
	getSelectedRow: function() {
		var selected = this.rowActivator.getSelected();
		
		return (selected.length > 0) ? selected[0] : null;
	},
	
	/**
	 * Get the cell at the given column index for the currently selected.
	 *
	 * @param index the column index (0 .. n-1)
	 * @public
	 */
	getSelectedRowCell: function(index) {
		var row = this.getSelectedRow();
		
		return row ? row.childElements()[index] : null;
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
	onHeaderClick: function(e) {
		var element = e.memo, index = this.headerActivator.getIndex(element);
		
		if (index >= 0) {
			this.sortColumn(index);
			this.render();
		}
	}
};

Object.inherit(Widget.Table, Widget);