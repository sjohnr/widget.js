Widget.RadioGroup = function(element) {
	this.super(element, {
		singleSelect: true
	});
	
	// add event handlers to instance
	this.bind($w("onRadioClick onRadioDblClick onRadioContextmenu"));
	
	this.observe("click", this.onRadioClick);
	this.observe("dblclick", this.onRadioDblClick);
	this.observe("contextmenu", this.onRadioContextmenu);
};

Widget.RadioGroup.prototype = {
	/**
	 * Toggle the given element of the radio group.
	 *
	 * @public
	 */
	setActiveElement: function(index, isSelected) {
		isSelected = (isSelected == null ? true : isSelected);
		this.setSelected(index, isSelected);
		
		this.fire("activeElementChange", this.getElement(index));
	},
	
	/** handlers **/
	onRadioClick: function(e) {
		var element = e.memo, index = this.elements.indexOf(element);
		
		this.setActiveElement(index, !this.isSelected(index));
	},
	
	onRadioDblClick: function(e) {
		var element = e.memo, index = this.elements.indexOf(element);
		
		this.setActiveElement(index);
	},
	
	onRadioContextmenu: function(e) {
		var element = e.memo, index = this.elements.indexOf(element);
		
		this.setActiveElement(index, true);
	},
	
	onMousedown: function(e) {
		this.superclass.onMousedown(e);
		
		// handle double-click hi-lite
		if (e.detail > 1) { // e.isDoubleClick()
			e.stop();
		}
	}
};

Object.inherit(Widget.RadioGroup, Widget.Group);