// create Widget namespace
if (typeof Widget == "undefined") {
	Widget = {};
}

(function() {

/**
 * The click event handler, to change the selected tab based on the navigation
 * element clicked, found in <code>e.memo.element</code>.
 * @param e
 * @private
 */
function tabViewClick(e) {
	var index = this.indexOf(e.memo.element);
	this.setActiveTab(index);
}

/**
 * Stop event bubbling when clicking on a tabview navigation element.
 * @param e
 * @private
 */
function stopBubbleClick(e) {
	e.stop();
}

/**
 * Retrieve the id in an <li> element assuming it contains a child
 * <a> element like the following: <a href="#element-id">...</a>
 * @param element
 * @private
 */
function getElementId(element) {
	return element.down("a").href.match(/#(.+)/)[1];
}

/**
 * Construct a Widget.TabView object.
 * @param element
 * @constructor Widget.Activator
 */
Widget.TabView = function(element) {
	element = $(element);
	
	var ul = element.down("ul");
	var div = element.down("div");
	Widget.Activator.call(this, {
		container: ul,
		singleSelect: true,
		elements: ul.childElements(),
	});
	
	// cache additional event handler
	this.eventHandlers.stopBubbleClick = stopBubbleClick.bindAsEventListener(this);
	
	// observe "activator:click" event
	this.observe(Widget.Activator.CLICK, tabViewClick.bindAsEventListener(this));
	this.container.observe("click", this.eventHandlers.stopBubbleClick);
	
	// initialize
	this.activeTab = null;
	this.setActiveTab(0);
};

/**
 * Class methods for Widget.TabView.
 * @prototype Widget.TabView
 */
Widget.TabView.prototype = Object.extend({
	/**
	 * Set the active tab to a given tab index.
	 * @param index
	 */
	setActiveTab: function(index) {
		var element = this.elementAt(index);
		var oldActiveTab = this.activeTab;
		var newActiveTab = $(getElementId(element));
		
		this.activeTab = newActiveTab;
		this.select(element);
		if (oldActiveTab != null) {
			oldActiveTab.hide();
		}
		newActiveTab.show();
	},
	/**
	 * Overridden destroy method.
	 */
	destroy: function() {
		Widget.Activator.prototype.destroy.call(this);
		this.container.stopObserving("click", this.eventHandlers.stopBubbleClick);
	},
}, Widget.Activator.prototype);
})();
