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

				/* Start map section */

				//Create a sized SVG surface within d3vis-container:
		    var mapsvg = d3.select("#d3map-container")
		        .append("svg")
		        .attr("width", width)
		        .attr("height", height);

		    // Append a group element to place all country shapes in
		    var g = mapsvg.append("g");

				// Set a map projection as well as other map configuration
				var projection = d3.geo.mercator()
				  .scale( 400 )
				  .center( [20, 0] )
				  .translate( [width/2,height/2] );

				// Set the projection to be used on all GeoJson paths
				var geoPath = d3.geo.path()
				    .projection( projection );

		    // Load the GeoJson shape data of countries in Africa
		    d3.json("/modules/custom/d3vis/js/africa.geo.json", function(error, mapdata) {
		    	if (error) throw error; // always great to check for errors	
		    		// Load the countries data again to use this data as well
		    		d3.json("/countries-api", function(error, countryData) {
				    	if (error) throw error; // always great to check for errors

							// Select all path to begin creating path elements
							g.selectAll("path")
								// We will be creating a path element for every data item in the mapdata array
							  .data( mapdata.features ).enter()
							  // Append the path
							  .append("path")
							  	// We fill the color with the default gray color unless it has a country name 
							  	// that appears in our countryData json array. If it does we color it blue.
								  .attr("fill", function(d, i) {
								  	// Countries will keep this default gray color if not found
								  	var fillColor = "#ccc";
								  	jQuery.each(countryData, function() {
										  if (this.title == d.properties.name_long) {
										  	// Found this country in our countrydata list. make it blue
										  	fillColor = "rgb(158, 202, 225)";
										  }
										});
										return fillColor; // Return the resulting background color
								  })
								  .attr("d", geoPath ) // Add the GeoJson path data to the d attribute
								  .attr("stroke-width", 1)
								  .attr("stroke", "#fff");
			    	});
		    	});
				/* End map section */
    	});
    }
  };
}(jQuery));