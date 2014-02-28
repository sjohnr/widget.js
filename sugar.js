// TODO: Test, decide whether this is useful
Enumerable.utilize = function(method, zipper) {
	return this.map(function(value, index) {
		return value[method].apply(value, zipper[index]);
	});
};

Enumerable.gather = function(ar) {
	return ar.map(function(value) {
		return this[value];
	});
};

Enumerable.project = Enumerable.zip;

Function.prototype.rcurry = function() {
	if (!arguments.length) {
		return this;
	}
	
	var __method = this, args = $A(arguments);
	return function() {
		return __method.apply(this, $A(arguments).concat(args));
	};
};

/*
Function.prototype.getInstance = function() {
	var instance = new this();
	function getInstance() {
		return instance;
	}
	
	this.prototype.constructor = getInstance;
	this.getInstance = getInstance;
	
	return getInstance();
};
*/

Function.prototype.getInstance = function() {
	if (this.__instance__ == null) {
		this.__instance__ = new this();
	}
	
	return this.__instance__;
};

Object.namespace = function(ns, target) {
	var obj = target || window, namespaces = ns.split(".");
	for (var i = 0; i < namespaces.length; i++) {
		obj[namespaces[i]] = obj[namespaces[i]] || {};
		obj = obj[namespaces[i]];
	}
	
	return obj;
};

Object.import = function(source, destination) {
	destination = destination || window;
	for (var key in source) {
		destination[key] = source[key];
	}
	
	return destination;
};

Object.sync = function(source, destination) {
	for (var key in source) {
		destination[key] = destination[key] || source[key];
	}
};

Object.borrow = function(destination, source) {
	for (var key in source) {
		destination[key] = destination[key] || source[key];
	}
	
	return destination;
};

Object.augment = function(destination, source) {
	for (var key in source.prototype) {
		destination.prototype[key] = destination.prototype[key] || source.prototype[key];
	}
	
	return destination;
};

Object.inherit = function(destination, source) {
	var obj = function() {}, tmp = destination.prototype;
	obj.prototype = source.prototype;
	destination.prototype = new obj();
	destination.prototype.constructor = destination;
	for (var key in tmp) {
		destination.prototype[key] = tmp[key];
	}
	
	var superclass = function() {}, tracker = {};
	for (var key in source.prototype) {
		superclass.prototype[key] = (function(methodName) {
			return function() {
				if (!(methodName in tracker)) {
					tracker[methodName] = 0;
				}
				
				var fn, result, cur = tracker[methodName], proto = source.prototype, prev = proto[methodName];
				while (cur > 0 || proto[methodName] == this.subclass[methodName]) {
					proto = proto.super.prototype.constructor.prototype;
					if (prev != proto[methodName]) {
						cur--;
						prev = proto;
					}
				}
				
				fn = proto[methodName];
				tracker[methodName]++;
				result = fn.apply(this.subclass, arguments);
				tracker[methodName]--;
				
				return result;
			};
		})(key);
	}
	
	destination.prototype.super = function() {
		if (!this.superclass) {
			this.superclass = new superclass();
			this.superclass.subclass = this;
		}
		
		var constructor = this.super.prototype.constructor;
		if (constructor.prototype.super) {
			this.super = constructor.prototype.super;
		}
		
		constructor.apply(this, arguments);
	};
	destination.prototype.super.prototype.constructor = source;
	
	return destination;
};

Object.isObject = function(obj) {
	return typeof obj == "object";
};

Object.isNumeric = function(obj) {
	return (typeof obj == "number") || (typeof obj == "string" && /^(-)?(\d*)(\.\d+)?$/.match(obj));
};

Date.prototype.format = function(mask) {
	var dF = Date.util;
	var d = this.getDate(),
		D = this.getDay(),
		m = this.getMonth(),
		y = this.getFullYear(),
		H = this.getHours(),
		M = this.getMinutes(),
		s = this.getSeconds(),
		L = this.getMilliseconds(),
		T = this.getTime(),
		o = this.getTimezoneOffset();
	var flags = {
		d: function() { return dF.pad(d); },
		D: function() { return dF.i18n.days.short[D]; },
		j: function() { return d; },
		l: function() { return dF.i18n.days.long[D]; },
		N: function() { return D + 1; },
		S: function() { return (d % 10 == 1 && d != 11) ? "st" : (d % 10 == 2 && d != 12) ? "nd" : (d % 10 == 13 && d != 1) ? "rd" : "th"; },
		w: function() { return D; },
		z: function() {
			return (function(idx) {
				return (idx < m) ? dF.util.months.lengths[idx] + ((idx == 1 && y % 4 == 0) ? 1 : 0) + arguments.callee(idx + 1) : d;
			})(0);
		},
		W: function() { return Math.floor(flags["z"]() / 7) + 1; },
		F: function() { return dF.i18n.months.long[m]; },
		m: function() { return dF.pad(m + 1); },
		M: function() { return dF.i18n.months.short[m]; },
		n: function() { return m + 1; },
		t: function() { return dF.util.months.lengths[m] + (y % 4 == 0 && m == 1) ? 1 : 0; },
		L: function() { return (y % 4 == 0); },
		o: function() { return "-NA-"; },
		Y: function() { return y; },
		y: function() { return String(y).substr(2); },
		a: function() { return H < 12 ? "am" : "pm"; },
		A: function() { return H < 12 ? "AM" : "PM"; },
		B: function() { return "-NA-"; },
		g: function() { return H % 12 || 12; },
		G: function() { return H; },
		h: function() { return dF.pad(H % 12 || 12); },
		H: function() { return dF.pad(H); },
		i: function() { return dF.pad(M); },
		s: function() { return dF.pad(s); },
		e: function() { return "-NA-"; },
		I: function() { return "-NA-"; },
		O: function() { return (o < 0 ? "+" : "-") + dF.pad(Math.floor(Math.abs(o) / 60)) + dF.pad(Math.abs(o) % 60); },
		P: function() { return (o < 0 ? "+" : "-") + dF.pad(Math.floor(Math.abs(o) / 60)) + ":" + dF.pad(Math.abs(o) % 60); },
		T: function() { return "-NA-"; },
		Z: function() { return o * 60; },
		c: function() { return "-NA-"; },
		r: function() { return this.toString(); },
		U: function() { return T / 1000; }
	};
	
	var result = "";
	for (var i = 0; i < mask.length; i++) {
		var char = mask.charAt(i);
		result += (char in flags) ? flags[char]() : char;
	}
	
	return result;
};

Date.prototype.strftime = function(format) {
	var day = this.getDay(), month = this.getMonth();
	var hours = this.getHours(), minutes = this.getMinutes();
	function pad(num) { return num.toPaddedString(2); };

	return format.gsub(/\%([aAbBcdHImMpSwyY])/, function(part) {
		switch(part[1]) {
			case 'a': return $w("Sun Mon Tue Wed Thu Fri Sat")[day]; break;
			case 'A': return $w("Sunday Monday Tuesday Wednesday Thursday Friday Saturday")[day]; break;
			case 'b': return $w("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec")[month]; break;
			case 'B': return $w("January February March April May June July August September October November December")[month]; break;
			case 'c': return this.toString(); break;
			case 'd': return pad(this.getDate()); break;
			case 'H': return pad(hours); break;
			case 'I': return pad((hours + 12) % 12); break;
			case 'm': return pad(month + 1); break;
			case 'M': return pad(minutes); break;
			case 'p': return hours > 12 ? 'PM' : 'AM'; break;
			case 'S': return pad(this.getSeconds()); break;
			case 'w': return day; break;
			case 'y': return pad(this.getFullYear() % 100); break;
			case 'Y': return this.getFullYear().toString(); break;
		}
	}.bind(this));
};

Date.util = {
	pad: function(value, length) {
		value = String(value), length = parseInt(length) || 2;
		while (value.length < length) {
			value = "0" + value;
		}
		
		return value;
	},
	i18n: {
		months: {
			short: $w("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec"),
			long: $w("January February March April May June July August September October November December")
		},
		days: {
			short: $w("Sun Mon Tue Wed Thu Fri Sat"),
			long: $w("Sunday Monday Tuesday Wednesday Thursday Friday Saturday")
		}
	},
	util: {
		months: {
			lengths: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
		}
	},
	masks: {
		"default": "D M d Y H:i:s",
		shortDate: "m/d/y",
		mediumDate: "M d, Y",
		longDate: "F d, Y",
		fullDate: "l, F d, Y",
		shortTime: "g:i A",
		mediumTime: "g:i:s A",
		longTime: "g:i:s A O",
		isoDate: "Y-m-d",
		isoTime: "G:i:s",
		isoDateTime: "Y-m-d G:i:s",
		isoFullDateTime: "Y-m-d G:i:s.0O"
	}
};