// create Widget namespace
if (typeof Widget == "undefined") {
	Widget = {};
}

(function() {

/**
 * Handle a button being clicked in toggle or radio mode.
 * @param e
 * @private
 */
function buttonClick(e) {
	var element = e.memo.element;
	if (this.options.singleSelect) {
		this.select(element);
	} else {
		if (this.isSelected(element)) {
			this.deselect(element);	
		} else {
			this.select(element);
		}
	}
}

/**
 * Construct a Widget.Button object.
 * @param element
 * @constructor Widget.Button
 */
Widget.Button = function(element, toggleButton) {
	// super(options...)
	Widget.Activator.call(this, {
		target: element,
	});
	
	// add singular element
	this.add(element);
	
	// observe "activator:click" event
	if (toggleButton == true) {
		this.observe(Widget.Activator.CLICK, buttonClick.bindAsEventListener(this));
	}
};

/**
 * Class methods for Widget.Button.
 * @prototype Widget.Button
 */
Widget.Button.prototype = Object.extend({
	
}, Widget.Activator.prototype);

})();
