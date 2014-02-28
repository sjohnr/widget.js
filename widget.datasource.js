// create Widget namespace
if (typeof Widget == "undefined") {
	Widget = {};
}

(function() {

/**
 * Verify that a piece of data is numeric or a string representing a number.
 * @param obj
 * @return boolean
 * @private
 */
function isNumeric(obj) {
	return (typeof obj == "number") || (typeof obj == "string" && /^(-)?(\d*)(\.\d+)?$/.match(obj));
};

/**
 * Evaluate a boolean expression by comparing two pieces of data.
 * @param a the first piece of data
 * @param b the second piece of data
 * @param op the operator to use for comparison
 * @return boolean the result of the comparison
 * @private
 */
function cmp(a, b, op) {
	if (isNumeric(a) && isNumeric(b)) {
		a = Number(a);
		b = Number(b);
	}
	
	switch (op) {
		case ">":  return a > b;
		case "<":  return a < b;
		case ">=": return a >= b;
		case "<=": return a <= b;
		case "!=": return a != b;
		case "%":  return (new RegExp(b.replace(/%/g, "(.*)"), "i")).test(a);
		case "=": default: return a == b;
	}
	
	return false;
}

/**
 * Evaluate a condition object against a row of data.
 * @param condition the condition object to evaluate
 * @param row a row of data
 * @return boolean true if the row passes, false otherwise
 */
function evaluate(condition) {
	return function(row) {
		return cmp(row[condition.field], condition.val, condition.operator);
	};
}

/**
 * Performs an AND on a list of boolean conditions or filters.
 * @param conditions the array of conditions
 * @param row a row of data
 * @return boolean true if the row passes, false otherwise
 * @private
 */
function and(conditions) {
	var condition = conditions[0], conditions = conditions.slice(1);
	var fn = Object.isFunction(condition) ? condition : evaluate(condition);
	return function(row) {
		return fn(row) && (conditions.length ? and(conditions)(row) : true);
	};
}

/**
 * Performs an OR on a list of boolean conditions or filters.
 * @param conditions the array of conditions
 * @param row a row of data
 * @return boolean true if the row passes, false otherwise
 * @private
 */
function or(conditions) {
	var condition = conditions[0], conditions = conditions.slice(1);
	var fn = Object.isFunction(condition) ? condition : evaluate(condition);
	return function(row) {
		return fn(row) || (conditions.length ? or(conditions)(row) : false);
	};
}

/**
 * Executes a formatter function on each desired piece of data.
 * @param data the array of data to format
 * @param formatters the hash of formatters
 * @return Array the formatted data
 * @private
 */
function getFormattedData(data, formatters) {
	for (var i = 0; i < data.length; i++) {
		for (var key in data[i]) {
			if (formatters[key]) {
				data[i][key].formatted = formatters[key](data[i][key], data[i], key);
			}
		}
	}
	
	return formatted;
}

/**
 * Executes and ANDs a series of conditions on each row of data.
 * @param data the array of data to filter
 * @param filters the array of filters
 * @return Array the filtered data
 * @private
 */
function getFilteredData(data, conditions) {
	var filtered = [], filter = and(conditions);
	for (var i = 0; i < data.length; i++) {
		if (filter(data[i])) {
			filtered.push(data[i]);
		}
	}
	
	return filtered;
}

/**
 * Construct a Widget.DataSource object.
 * @param data
 * @param filters
 * @param formatters
 * @constructor Widget.DataSource
 */
Widget.DataSource = function(data, filters, formatters) {
	this.data = data || [];
	this.filters = filters || null; // [ function(x) { return true; } ];
	this.formatters = formatters || null;
};

/**
 * Class methods for Widget.ButtonGroup.
 * @prototype Widget.ButtonGroup
 */
Widget.DataSource.prototype = {
	/**
	 * Return the data from the data store.
	 * Automatically filters and formats data, if applicable.
	 * @public
	 */
	getData: function() {
		var data = this.data;
		data = (this.filters == null) ? data : getFilteredData(data, this.filters);
		data = (this.formatters == null) ? data : getFormattedData(data, this.formatted);
		
		return data;
	},
};

// Widget.DataSource static methods
Object.extend(Widget.DataSource, {
	/**
	 * Create a Widget.DataSource object from an existing HTML table.
	 * @param element
	 * @return object Widget.DataSource
	 */
	fromHTMLTable: function(element) {
		element = $(element);
		
		var thead = element.down("thead");
		var tbody = element.down("tbody");
		var columnDefs = thead.down("tr").childElements().pluck("className");
		
		var data = [];
		var trs = tbody.childElements();
		for (var i = 0; i < trs.length; i++) {
			var row = {};
			var tds = trs[i].childElements();
			for (var j = 0; j < tds.length; j++) {
				row[columnDefs[j]] = tds[j].innerHTML;
			}
			
			data.push(row);
		}
		
		return new Widget.DataSource(data);
	},
});

})();
