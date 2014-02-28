// TODO finish

// create Widget namespace
if (typeof Widget == "undefined") {
	Widget = {};
}

(function() {

/**
 * Cause a header to be selected, and a column to be
 * sorted when clicked.
 */
function headerColumnClick(e) {
	var element = e.memo.element;
	var index = this.theadActivator.indexOf(element);
	var selectedElements = this.theadActivator.getSelectedElements();
	var selected = (selectedElements.length > 0) ? selectedElements[0] : null;
	if (selected != null) {
		selected.removeClassName(this.options.classNames.ascending);
	}
	
	this.theadActivator.select(element);
	element.addClassName(this.options.classNames.ascending);
	this.sortByColumnIndex(index);
}

/**
 * Create a table-row from data.
 * @param row
 * @param columnDefs
 * return object DOMNode
 */
function createRow(row, columnDefs) {
	var tr = new Element("tr"), td;
	for (var i = 0; i < columnDefs.length; i++) {
		td = new Element("td");
		td.innerHTML = row[columnDefs[i]];
		
		tr.appendChild(td);
	}
	
	return tr;
}

/**
 * Update a table-row from data.
 * @param tr
 * @param data
 * @param columnDefs
 * return object DOMNode
 */
function updateRow(tr, data, columnDefs) {
	var tds = tr.childElements();
	for (var i = 0; i < columnDefs.length; i++) {
		if (td.innerHTML != row[columnDefs[i]]) {
			td.innerHTML = row[columnDefs[i]];
		}
	}
	
	return tr;
}

/**
 * Cause a row to be selected when clicked.
 */
function tableRowClick(e) {
	var element = e.memo.element;
	if (this.tbodyActivator.isSelected(element)) {
		this.tbodyActivator.deselect(element);
	} else {
		this.tbodyActivator.select(element);
	}
}

/**
 * Construct a Widget.Table object.
 * @param element
 * @param ds
 * @constructor Widget.Table
 */
Widget.Table = function(element, ds) {
	// super(options...)
	Widget.Activator.call(this, {
		container: element,
	});
	
	// add classNames to options
	Object.extend(this.options.classNames, {
		ascending:  "asc",
		descending: "desc",
	});
	
	// create column activator
	var theadActivator = new Widget.Activator({
		container:    this.container.down("thead"),
		selector:     "th",
		singleSelect: true,
	});
	
	// create row activator
	var tbodyActivator = new Widget.Activator({
		container:    this.container.down("tbody"),
		selector:     "tr",
		singleSelect: true,
	});
	
	// observe click events for column sorting and row highlighting
	theadActivator.observe(Widget.Activator.CLICK, headerColumnClick.bindAsEventListener(this));
	tbodyActivator.observe(Widget.Activator.CLICK, tableRowClick.bindAsEventListener(this));
	
	// initialize this object
	this.columnDefs = theadActivator.elements.pluck("className");
	this.theadActivator = theadActivator;
	this.tbodyActivator = tbodyActivator;
	this.ds = ds;
};

/**
 * Class methods for Widget.Table.
 * @prototype Widget.Table
 */
Widget.Table.prototype = Object.extend({
		render: function(data) {
			data = data || this.ds.getData();
			this.tbodyActivator.container.innerHTML = "";
			
			var tr;
			for (var i = 0; i < data.length; i++) {
				tr = (data[i].tr) ? updateRow(data[i].tr, data[i], this.columnDefs) : createRow(data[i], this.columnDefs);
				this.tbodyActivator.container.appendChild(tr);
				$w("even odd").each(tr.removeClassName, tr);
				tr.addClassName(i % 2 == 1 ? "even" : "odd");
			}
		},
		sortByColumnIndex: function(index) {
			var trs = this.tbodyActivator.elements;
			trs = trs.sortBy(function(tr) {
				return tr.childElements()[index].innerHTML;
			}, this);
			
			trs.each(this.tbodyActivator.container.insert, this.tbodyActivator.container);
		},
}, Widget.Activator.prototype);

// Widget.Table constants
Object.extend(Widget.Table, {
	
});

})();
