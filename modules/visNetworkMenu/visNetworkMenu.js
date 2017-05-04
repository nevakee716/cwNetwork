vis.contextMenu = function (menu, openCallback) {

	// create the div element that will hold the context menu
	d3.selectAll('.visNetworkMenu').data([1])
		.enter()
		.append('div')
		.attr('class', 'visNetworkMenu');

	// close menu
	d3.select('body').on('click.visNetworkMenu', function() {
		d3.select('.visNetworkMenu').style('display', 'none');
	});

	// this gets executed when a contextmenu event occurs
	return function(data, index) {	
		var elm = this;

		d3.selectAll('.visNetworkMenu').html('');
		var list = d3.selectAll('.visNetworkMenu').append('ul');
		list.selectAll('li').data(menu).enter()
			.append('li')
			.html(function(d) {
				return d.title;
			})
			.on('click', function(d, i) {
				d.action(elm, data, index);
				d3.select('.visNetworkMenu').style('display', 'none');
			});

		// the openCallback allows an action to fire before the menu is displayed
		// an example usage would be closing a tooltip
		if (openCallback) openCallback(data, index);
		// display context menu
		if(data.nodes.length > 0) {
			d3.select('.visNetworkMenu')
				.style('left', (data.event.pageX - 2) + 'px')
				.style('top', (data.event.pageY - 2) + 'px')
				.style('display', 'block');
		}

		data.event.preventDefault();
	};
};