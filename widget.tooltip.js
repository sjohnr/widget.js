// create Widget namespace
if (typeof Widget == "undefined") {
	Widget = {};
}

(function() {

/**
 * Handle the mouseover event for a tooltip activator.
 * @param e
 * @private
 */
function mouseover(e) {
	var element = this.find(e.memo.element);
	var offsets = element.positionedOffset();
	var locationOffsets = this.offsetsFor(offsets[0], offsets[1]);
	this.timerID = window.setTimeout(function() {
		this.tooltip.style.left = locationOffsets.x+"px";
		this.tooltip.style.top  = locationOffsets.y+"px";
		this.tooltip.style.display = "block";
		this.timerID = null;
	}.bind(this), 200);
}

/**
 * Handle the mouseout event for a tooltip activator.
 * @param e
 * @private
 */
function mouseout(e) {
	var element = this.find(e.memo.element);
	if (this.timerID == null) {
		this.tooltip.style.display = "none";
	} else {
		window.clearTimeout(this.timerID);
	}
}

/**
 * Construct a Widget.ToolTip object.
 * @param element
 * @param tooltip
 * @param fn <code>function(x, y)</code> to calculate location of tooltip
 * @constructor Widget.ToolTip
 */
Widget.ToolTip = function(element, tooltip, fn) {
	Widget.Activator.call(this, {
		target: element,
	});
	
	// add singular element
	this.add(element);
	
	// observe "activator:mouseover" event
	this.observe(Widget.Activator.MOUSEOVER, mouseover.bindAsEventListener(this));
	this.observe(Widget.Activator.MOUSEOUT, mouseout.bindAsEventListener(this));
	
	// initialization
	this.tooltip = $(tooltip);
	this.timerID = null;
	if (fn != null) {
		this.offsetsFor = fn;
	}
};

/**
 * Class methods for Widget.ToolTip.
 * @prototype Widget.ToolTip
 */
Widget.ToolTip.prototype = Object.extend({
	/**
	 * Retrieve a tool-tip location, given the x/y coords of the clicked
	 * tooltip activator.
	 * @param x the horizontal coord of the clicked activator
	 * @param y the vertical coord of the clicked activator
	 * @returns a hash with x/y parameters, e.g. <code>{x: 1234, y: 5678}</code>
	 * @abstract
	 */
	offsetsFor: function(x, y) {
		throw new Exception("Please implement the #offsetsFor() method.");
	},
}, Widget.Activator.prototype);

})();
