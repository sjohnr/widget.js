Widget.TabView = function(element) {
	element = $(element);
	
	// cache tabview (this) in DOM element
	element.tabview = this;
	
	// get nav and container elements
	var nav = element.down("ul.nav");
	var container = element.down("div.content");
	
	// create nav activator object
	this.super(nav, {
		singleSelect: true
	});
	
	// add event handlers to instance
	this.bind($w("onTabViewClick"));
	
	// hide tab content
	container.childElements().invoke("hide");
	
	// select first element
	this.setActiveTab(0);
	
	// register for click event
	this.observe("click", this.onTabViewClick);
	
	// initialize
	this.nav = nav;
	this.container = container;
};

Widget.TabView.prototype = {
	setActiveTab: function(index) {
		var memo = {};
		
		// disable original tab
		if (this.active) {
			this.active.hide();
		}
		
		// memorize previous value
		memo.prevTab = this.active;
		
		// select new tab
		this.setSelected(index);
		this.active = $(this.getElementId(this.getElement(index)));
		this.active.show();
		
		// memorize new value
		memo.newTab = this.active;
		
		// fire custom event
		this.fire("activeTabChange", memo);
	},
	
	getActiveTab: function() {
		return this.active;
	},
	
	getElementId: function(element) {
		return element.down("a").href.match(/#(.+)/)[1];
	},
	
	addTab: function(name, label) {
		var li = new Element("li"), div = new Element("div", {id: name});
		
		li.appendChild(new Element("a", {href: "#"+name}).update(label));
		this.nav.appendChild(li);
		this.container.appendChild(div);
		
		// add to radio group
		this.addElement(li);
	},
	hasTab: function(name) {
		return this.container.childElements().pluck("id").include(name);
	},
	getTabIndex: function(name) {
		return this.container.childElements().pluck("id").indexOf(name);
	},
	
	/** handlers **/
	onClick: function(e) {
		this.superclass.onClick(e);
		e.stop();
	},
	onTabViewClick: function(e) {
		var element = e.memo;
		var index = this.elements.indexOf(element);
		
		this.setActiveTab(index);
	}
};

Object.inherit(Widget.TabView, Widget.Group);
