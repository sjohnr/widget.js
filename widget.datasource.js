Widget.DataSource = function(data, filters, formatters) {
	filters = filters && filters.length ? filters : null;
	
	this.data = data || [];
	this.filters = filters || [ function(x) { return true; } ];
	this.formatters = formatters || {};
};

Widget.DataSource.prototype = (function() {
	/**
	 * Evaluate a boolean expression by comparing two pieces of data.
	 *
	 * @param a the first piece of data
	 * @param b the second piece of data
	 * @param op the operator to use for comparison
	 * @return boolean the result of the comparison
	 *
	 * @private
	 */
	function cmp(a, b, op) {
		if (Object.isNumeric(a) && Object.isNumeric(b)) {
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
	 *
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
	 *
	 * @param conditions the array of conditions
	 * @param row a row of data
	 * @return boolean true if the row passes, false otherwise
	 *
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
	 *
	 * @param conditions the array of conditions
	 * @param row a row of data
	 * @return boolean true if the row passes, false otherwise
	 *
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
	 *
	 * @param data the array of data to format
	 * @param formatters the hash of formatters
	 * @return Array the formatted data
	 *
	 * @private
	 */
	function getFormattedData(data, formatters) {
		data.each(function(row) {
			for (var key in row) {
				if (formatters[key]) {
					row.formatted = row.formatted || {};
					row.formatted[key] = formatters[key](row[key], row, key);
				}
			}
		});
		
		return data;
	}
	
	/**
	 * Executes and ANDs a series of conditions on each row of data.
	 *
	 * @param data the array of data to filter
	 * @param filters the array of filters
	 * @return Array the filtered data
	 *
	 * @private
	 */
	function getFilteredData(data, conditions) {
		var filtered = [], filter = and(conditions);
		data.each(function(row) {
			if (filter(row)) {
				filtered.push(row);
			}
		});
		
		return filtered;
	}
	
	return {
		/**
		 * Set the internal data store, for reuse of datasource across multiple requests.
		 *
		 * @public
		 */
		setData: function(data) {
			this.data = data;
		},
		
		/**
		 * Return the data from the data store.
		 * Automatically filters and formats data, if applicable.
		 *
		 * @public
		 */
		getData: function() {
			var data = this.data;
			
			data = getFilteredData(data, this.filters);
			data = getFormattedData(data, this.formatters);
			
			return data;
		},
		
		/**
		 * Set the filter list.
		 *
		 * @public
		 */
		setFilters: function(filters) {
			this.filters = filters;
		},
		
		/**
		 * Get the filter list by reference, for manipulation after creating a Widget.DataSource.
		 *
		 * @public
		 */
		getFilters: function() {
			return this.filters;
		},
		
		/**
		 * Set the formatter list.
		 *
		 * @public
		 */
		setFormatters: function(formatters) {
			this.formatters = formatters;
		},
		
		/**
		 * Get the formatter list by reference, for manipulation after creating a Widget.DataSource.
		 *
		 * @public
		 */
		getFormatters: function() {
			return this.formatters;
		},
	};
})();

Object.inherit(Widget.DataSource, Widget);