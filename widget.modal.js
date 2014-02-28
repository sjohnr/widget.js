Widget.Modal = function(element, options) {
	this.super(null, Object.extend({
		position: "absolute",
		top: "100px",
		left: "300px",
		width: "300px",
		height: "300px",
		title: "Modal",
		content: "Some content..."
	}, options || {}));
	
	// perform creation of modal element, if necessary
	this.element = $(element) || this.create(element);
	
	// add styles to element
	this.element.setStyle({
		position: this.get("position"),
		top: this.get("top"),
		left: this.get("left"),
		width: this.get("width"),
		height: this.get("height"),
		display: "none"
	});
	
	// add modal to body
	document.body.appendChild(this.element);
};
Widget.Modal.prototype = {
	create: function(elementID) {
		var element = new Element("div", {id: elementID, className: "modal"}),
			header = new Element("div", {className: "header"}),
			title = new Element("div", {className: "title"}),
			x = new Element("a", {className: "close", href: "#"}),
			body = new Element("div", {className: "body"});
		
		// add content
		title.update(this.get("title"));
		x.update("close");
		body.update(this.get("content"));
		
		// add behaviors
		x.observe("click", function(e) {
			this.hide();
			e.stop();
		}.bindAsEventListener(this));
		
		// append children to containers
		[title, x].each(header.appendChild, header);
		[header, body].each(element.appendChild, element);
		
		return element;
	},
	show: function() {
		this.element.show();
		
		// fire show handler
		this.fire("show", this.element);
	},
	hide: function() {
		this.element.hide();
		
		// fire hide event
		this.fire("hide", this.element);
	},
	
	destroy: function() {
		this.superclass.destroy();
		this.element.up().removeChild(this.element);
	}
};

/** ajax **/
Widget.AjaxModal = function(element, url, options) {
	this.super(element, Object.extend({
		content: "Loading..."
	}, options || {}));
	
	new ecx.util.Ajax.Request(url, {
		method: "get",
		onSuccess: this.request.bind(this)
	});
};
Widget.AjaxModal.prototype = {
	request: function(response) {
		this.element.down(".body").update(response.responseText);
	}
};

/** iframe **/
Widget.IFrameModal = function(element, url, options) {
	this.super(element, Object.extend({
		content: ""
	}, options || {}));
	
	var iframe = new Element("iframe");
	iframe.src = url;
	this.element.down(".body").appendChild(iframe);
};
Widget.IFrameModal.prototype = {
	
};

/** tooltip **/
Widget.ToolTip = function(element, message) {
	this.super(element);
	
	// the element to use as target of the tooltip
	this.target = $(target);
	
	var element = new Element("p");
	element.update(message);
	element.addClassName("tooltip");
	document.body.appendChild(element);
	this.super(element);
};

Widget.ToolTip.prototype = {
	
};

Object.inherit(Widget.Modal, Widget);
Object.inherit(Widget.AjaxModal, Widget.Modal);
Object.inherit(Widget.IFrameModal, Widget.Modal);
Object.inherit(Widget.ToolTip, Widget);