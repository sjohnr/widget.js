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
function buttonClicked(e) {
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
 * Construct a Widget.ButtonGroup object.
 * @param element
 * @constructor Widget.ButtonGroup
 */
Widget.ButtonGroup = function(element, type) {
	type = type || Widget.ButtonGroup.BUTTON_TYPE;
	
	var observeClick = (type == Widget.ButtonGroup.TOGGLE_TYPE || type == Widget.ButtonGroup.RADIO_TYPE);
	var singleSelect = (type == Widget.ButtonGroup.RADIO_TYPE);
	
	// super(options...)
	Widget.Activator.call(this, {
		container:    element,
		selector:     "button",
		singleSelect: singleSelect,
	});
	
	// observe "activator:click" event
	if (observeClick == true) {
		this.observe(Widget.Activator.CLICK, buttonClicked.bindAsEventListener(this));
	}
};

/**
 * Class methods for Widget.ButtonGroup.
 * @prototype Widget.ButtonGroup
 */
Widget.ButtonGroup.prototype = Object.extend({
	
}, Widget.Activator.prototype);

// Widget.ButtonGroup constants
Object.extend(Widget.ButtonGroup, {
	BUTTON_TYPE: 1,
	TOGGLE_TYPE: 2,
	RADIO_TYPE:  3,
});

})();
