(function ($) {
  'use strict';
  Drupal.behaviors.d3vis_src = {
    attach: function(context, settings) {
    	// This just ensures this JS is called once to avoid Drupal ajax recalls
    	$(context).find('#block-d3visblock').once('d3vis_src').each(function () {

    		// Set the variables used to control the svg size
    		var width = 600;
    		var height = 600;
    		// Nicer to set how high the bars should be
    		var barHeight = 30;

    		//Create a sized SVG surface within d3vis-container:
		    var vizsvg = d3.select("#d3vis-container")
		        .append("svg")
		        .attr("width", width)
		        .attr("height", height);
    		
    		// Use D3 to fetch the json data from the Drupal REST path
    		d3.json("/countries-api", function(error, data) {
  				if (error) throw error; // always great to check for errors	

  				/* We use this to scale all date to fit the max width of
  				 	the viewing area. It translates our data range which is the domain
  				 	into the viewable area width which is the range */
  				var widthScale = d3.scale.linear()
  					.domain([0, d3.max(data, function(d) {
  						/* We determine the upper range of our data by using the 
									max function which determines the maximum value in a dataset */
  						return checkInt(d.field_active_volunteers_total) 
  							+ checkInt(d.field_volunteer_positions_availa); })])
  					.range([0, width-20]);

				 	// Create dom elements for the total bar
				 	vizsvg.selectAll(".total-bar")
				 		// Iterate over each data node
      			.data(data)
      				.enter()
      					// create a rect element
      					.append("rect")
      						// Assign attributes to the rect element
	      					.attr("class", "total-bar")
	      					.attr("rx", 14) //Just adds rounded corners
	      					.attr("ry", 14) //Just adds rounded corners
	      					.attr("x", 5) // Set the horizontal position of the bar
	      					// Set the vertical position of the bar
	      					.attr("y", function(d, i) {
	      						// i is the current data node index
	      						return (i * (barHeight + 5)) + 25;
	      					})
	      					/* The width of the bar uses a function to combine the two 
	      						field values to calculate the total width */
	      					.attr("width", function(d, i) {
	      						return (widthScale(checkInt(d.field_active_volunteers_total) 
	      							+ checkInt(d.field_volunteer_positions_availa)));
	      					})
						      .attr("height", barHeight);

					// Create dom elements for the progress bar
					vizsvg.selectAll(".progress-bar")
						// Iterate over each data node
      			.data(data)
      				.enter()
      					// create a rect element
      					.append("rect")
	      					.attr("class", "progress-bar")
	      					.attr("rx", 14) //Just adds rounded corners
	      					.attr("ry", 14) //Just adds rounded corners
	      					.attr("x", 5) // Set the horizontal position of the bar
	      					// Set the vertical position of the bar
	      					.attr("y", function(d, i) {
	      						// i is the current data node index
	      						return (i * (barHeight + 5)) + 25;
	      					})
	      					// Width is set to 0 as we will transition it in later
	      					.attr("width", 0)
						      .attr("height", barHeight);

					// Create dom elements for the Country names
					vizsvg.selectAll(".title")
						// Iterate over each data node
      			.data(data)
      				.enter()
      					// create a text element
      					.append("text")
      						.attr("class", "title")
      						// Position the title to be on the corresponding bar
      						.attr("x", 11)
      						.attr("y", function(d, i) {
	      						// i is the current data node index
	      						return (i * (barHeight + 5)) + 46;
	      					})
	      					// Set the content of the text element to be the country name
	      					.text(function(d) {
	      						return (d.title);
	      					});

	      	/* Create a transition effect on the progress bar. This makes it grow
	      	 from 0 width to the total width it should be in an animated way */
	      	vizsvg.selectAll(".progress-bar")
	      		.transition()
				      .duration(750) // The transition will take less than a second
				      /* We set the ending state for the transition which is that it have
				       a width attribute of the total active volunteers scaled of course. 
				       The D3 animation function takes care of everything in between */
				      .attr("width", function(d, i) {
    						return (widthScale(checkInt(d.field_active_volunteers_total)));
    					});
				});

				/*
				 * This function is used to ensure values are actually numbers
				 */
				function checkInt(number) {
					// Some values contain false if they are empty
					var thisNumber = parseInt(number);
					if (isNaN(thisNumber)) {
						return 0;
					}
					else {
						return thisNumber;
					}
				}
    	});
    }
  };
}(jQuery));