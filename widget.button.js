Widget.Button = function(element) {
	this.super(element, {
		className: "button",
		splitClassName: "split",
		checkboxClassName: "checkbox"
	});
	
	// cache button (this) in DOM element
	this.element.button = this;
};
Widget.Button.prototype = {
	getButtonElement: function() {
		return this.element.down("button");
	},
	
	getMenuElement: function() {
		return this.element.down("ul");
	},
	
	getInputElement: function() {
		return this.element.down("input");
	}
};

Widget.CheckboxButton = function(element) {
	this.super(element);
	
	// add event handlers to instance
	this.bind($w("onButtonClick"));
	
	var button = this.getButtonElement();
	this.checked = false;
	
	Object.extend(this.element, {
		isChecked: function() {
			return this.activator.isSelected();
		},
		setChecked: function(isChecked) {
			this.activator.setSelected(isChecked);
		}
	});
	
	this.observe("click", this.onButtonClick);
};
Widget.CheckboxButton.prototype = {
	/** handlers **/
	onButtonClick: function(e) {
		this.setSelected(!this.isSelected());
		
		this.fire("checkedStateChange");
	}
};

Widget.MenuButton = function(element) {
	this.super(element);
	
	var element = this.getMenuElement(), menu = new Widget.Menu(element);
	this.menu = menu;
	
	this.menu.observe("click", this.onMenuClick);
};
Widget.MenuButton.prototype = {
	click: function(element) {
		var my = this.menu.element.getDimensions(), dimensions = document.viewport.getDimensions(), offsets = element.viewportOffset(),
			x = (my.width + offsets.left + this.menu.get("pageOffset") > dimensions.width) ? -element.up().getDimensions().width + element.getDimensions().width : 0,
			y = element.getDimensions().height;
		
		this.menu.show(x, y);
	},
	
	/** handlers **/
	onClick: function(e) {
		var element = e.element();
		if (element.hasClassName(this.get("splitClassName")) && this.isEnabled()) {
			this.click(element);
		} else {
			this.superclass.onClick(e);
		}
		
		e.stop();
	},
	
	onMenuClick: function(e) {
		e.stop();
	}
};

Widget.EditableButton = function(element) {
	this.super(element);
	
	var element = this.getMenuElement(), menu = new Widget.Menu(element);
	this.menu = menu;
	
	this.bind($w("onMenuClick onInputClick"));
	this.menu.observe("click", this.onMenuClick);
	this.getInputElement().observe("click", this.onInputClick);
	this.clicked = false;
};
Widget.EditableButton.prototype = {
	click: function(element) {
		var my = element.getDimensions(), x = 0, y = my.height;
		
		this.menu.show(x, y);
	},
	
	addItem: function(label) {
		this.menu.addItem({label: label});
	},
	setValue: function(value) {
		this.addItem(value);
		this.getInputElement().value = value;
	},
	getValue: function() {
		return this.getInputElement().value;
	},
	
	/** handlers **/
	onClick: function(e) {
		var element = e.element();
		if (element.hasClassName(this.get("splitClassName")) && this.isEnabled()) {
			this.click(element);
		}
		
		e.stop();
	},
	onMenuClick: function(e) {
		var element = e.memo, input = this.getInputElement(), value = element.down("a").innerHTML;
		
		input.value = value;
		input.focus();
		e.stop();
		
		return value;
	},
	onInputClick: function(e) {
		var element = e.element();
		if (!this.clicked) {
			element.value = "";
			this.clicked = true;
		}
	}
};

Object.inherit(Widget.Button, Widget.Activator);
Object.inherit(Widget.CheckboxButton, Widget.Button);
Object.inherit(Widget.MenuButton, Widget.Button);
Object.inherit(Widget.EditableButton, Widget.Button);