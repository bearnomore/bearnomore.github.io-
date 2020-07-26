// Load and munge data, then make the visualization.
var fileName = "https://raw.githubusercontent.com/bearnomore/CS498Visualization/master/age_structure_by_income.csv";
var ageFields = ["0-19", "20-39", "40-59", "60+"];

d3.csv(fileName, function(data) {
	var incomeMap = {};
	data.forEach(function(d) {
		var income = d.IncomeGroup;
		incomeMap[income] = [];

		// { incomeGroupName: [ bar1Val, bar2Val, ... ] }
		ageFields.forEach(function(field) {
			incomeMap[income].push( +d[field] );
		});
	});
   
   // Define dimensions of chart
	var margin = {top: 10, right: 30, bottom: 50, left: 60},
		svg_dx = 500,
		svg_dy = 300,
		width  = svg_dx - margin.left - margin.right,
		height = svg_dy - margin.top  - margin.bottom;
		
	// Make x scale
	var xScale = d3.scaleBand()
				   .domain(ageFields)
				   .range([20, width]);
		
	// Make y scale, the domain will be updated
	var yScale = d3.scaleLinear()
				   .range([height, 0]);
				   
	// Create svg
	var svg3 = d3.select("#viz3")
				 .append("svg")
				 .attr("width",  svg_dx)
				 .attr("height", svg_dy)
				 .append("g")
				 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");	
	// Add x and y axis
	var xAxis = svg3.append("g")
				    .attr("transform", "translate(0," + height + ")")
				    .call(d3.axisBottom(xScale));
				  
	var yAxis = d3.axisLeft(yScale);	
	var yAxisHandle = svg3.append("g")
		                  .attr("class", "y axis")
		                  .call(yAxis);
				   
	// Add y-axis label
	
	svg3.append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", -margin.left + 20)
	    .attr("x", -margin.top - height/2 + 60)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text("Precentage (%)")
	    .style("padding-right", "5px")
	    .style("font-size","16px");
	   
	// Define bar width
	var barWidth = width/ageFields.length-10;
	   
	var updateBars = function(data) {
		// First update the y-axis domain to match data
		yScale.domain( [d3.extent(data)[0]-5, d3.extent(data)[1]] );
		yAxisHandle.call(yAxis);

		var bars = svg3.selectAll(".bar").data(data);

		// Add bars for new data
		bars.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("x", function(d,i) { return xScale( ageFields[i] ); })
			.attr("width", barWidth)
			.attr("y", function(d) { return yScale(d); })
			.attr("height", function(d) { return height - yScale(d); })
			.style("fill", "#00BFFF")
			.style("stroke", "#000000");

		// Update old ones, already have x / width from before
		bars
			.transition().duration(250)
			.attr("y", function(d,i) { return yScale(d); })
			.attr("height", function(d,i) { return height - yScale(d); });

		// Remove old ones
		bars.exit().remove();
	};

	// Handler for dropdown value change
	var dropdownChange = function() {
		var newIncome = d3.select(this).property('value'),
			newData   = incomeMap[newIncome];

		updateBars(newData);
	};	
	
	// Get names of income groups for the dropdown menu
	var incomes = Object.keys(incomeMap).sort();

	var dropdown = d3.select("#viz3")
					 .insert("select", "svg")
					 .on("change", dropdownChange);

	dropdown.selectAll("option")
			.data(incomes)
			.enter()
			.append("option")
			.attr("value", function (d) { return d; })
			.text(function (d) {
								 return d[0]+d.slice(1,d.length); 
								}
				);
	
	var initialData = incomeMap[ incomes[0] ];
	
	updateBars(initialData);
});