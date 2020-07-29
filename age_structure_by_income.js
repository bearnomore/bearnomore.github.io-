// Load and munge data, then make the visualization.
var fileName = "https://raw.githubusercontent.com/bearnomore/bearnomore.github.io-/master/age_structure_by_income.csv";
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
   console.log(Object.keys(data[0]).includes(ageFields[0]));
   // Define dimensions of chart
	var margin = {top: 30, right: 30, bottom: 50, left: 60},
		svg_dx = 600,
		svg_dy = 400,
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
	var svg = d3.select("#viz3")
				.append("svg")
				.attr("width",  svg_dx)
				.attr("height", svg_dy)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");	
	// Add x and y axis
	var xAxis = d3.axisBottom(xScale);
	var xAxisHandle = svg.append("g")
						 .attr("class", "x axis")
						 .attr("transform", "translate(0," + height + ")")
						 .call(xAxis);
				  
	var yAxis = d3.axisLeft(yScale);	
	var yAxisHandle = svg.append("g")
						 .attr("class", "y axis")
						 .call(yAxis);
				   
	// Add y-axis label
	
	svg.append("text")
	   .attr("transform", "rotate(-90)")
	   .attr("y", -margin.left + 10)
	   .attr("x", -margin.top - height/2 + 60)
	   .attr("dy", ".71em")
	   .style("text-anchor", "end")
	   .text("Precentage (%)")
	   .style("font-size","16px");
	
	var tooltip = d3.select("#viz3")
			.append("div")
			.style("opacity", 0)
			.attr("class", "tooltip")
			.style("background-color", "white")
			.style("border", "none")
			.style("position", "absolute")
			.style("border-width", "1px")
			.style("border-radius", "5px")
			.style("padding", "10px")
			
	   
	// Define bar width
	var barWidth = width/ageFields.length-20;
	   
	var updateBars = function(data) {
		// First update the y-axis domain to match data
		yScale.domain( [d3.extent(data)[0]-5, d3.extent(data)[1]] ); // need to minus a number such as 5, or the lowest bar won't diaplay
		yAxisHandle.call(yAxis);

		var bars = svg.selectAll(".bar").data(data);

		// Add bars for new data
		bars.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("x", function(d,i) { return xScale( ageFields[i] ); })
			.attr("width", barWidth)
			.attr("y", function(d) { return yScale(d); })
			.attr("height", function(d) { return height - yScale(d); })
			.style("fill", "#00BFFF")
			.style("stroke", "#000000")
			.on("mouseover", mouseover)
			.on("mouseleave", mouseleave);

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
	
	var mouseover = function(d){
	  
	  console.log(d3.event.pageY);
	  var value = d3.select(this).datum();
	  tooltip.html(value + "%")
			 .style("opacity", 1)
			 .style("left", d3.event.pageX + "px")
			 .style("top", (d3.event.pageY - 20) +"px");
	  d3.select(this).style("fill", "#0431B4");
	}
	
	
	/*
	var mouseover = function(d){
		tooltip.style("opacity", 0.8);
		d3.select(this).style("fill", "#0431B4");
	}
	
	
	var mousemove = function(d){
		
		
		 console.log(d);
		 tooltip.style("left", (d3.event.pageX) + "px") 
				.style("top", (d3.event.pageY) + "px")
				.html(d + "%");
	}*/
	
	var mouseleave = function(d){
		
		tooltip.transition()
				.duration(300)
				.style("opacity", 0);
						  
		d3.select(this).style("fill", d? "#00BFFF":"#0431B4");
		
	}
	
	
	// Get names of income groups for the dropdown menu
	var incomes = Object.keys(incomeMap);

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



