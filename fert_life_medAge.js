var margin =  {top: 10, right: 30, bottom: 50, left: 60},
    svg_dx = 500, 
    svg_dy = 400,
    width = svg_dx - margin.right - margin.left,
    height = svg_dy - margin.top - margin.bottom;
	
var x = d3.scaleLinear().domain([0, 8]).range([ 0, width ]);
var y = d3.scaleLinear().domain([45, 95]).range([ height, 0]);
			
var regions = ['Africa', 'Arab States', 'Asia & Pacific', 'Europe', 'Middle east', 'North America','South/Latin America'],
	colorMap = [ "#98FB98","#BDB76B", "#00BFFF","#A9A9A9", "#A52A2A", "#BA55D3", "#FF8C00"];

var color = d3.scaleOrdinal()
              .domain(regions)
              .range(colorMap);
		
var svg2 = d3.select("#viz2")
            .append("svg")
            .attr("width", svg_dx)
            .attr("height", svg_dy)
		    .append("g")
            .attr("transform","translate(" + margin.left + "," + margin.top + ")");
			

d3.csv("https://raw.githubusercontent.com/bearnomore/CS498Visualization/master/world_profile20.csv", d => {	
	        
			
	svg2.append("g")
	   .attr("transform", "translate(0," + height + ")")
	   .call(d3.axisBottom(x));
					  
	svg2.append("g")
	   .call(d3.axisLeft(y));
	   
	// Add X axis label:
	svg2.append("text")
	   .attr("text-anchor", "end")
	   .attr("x", width/2 + margin.left)
	   .attr("y", height + margin.top + 25)
	   .text("Fertility Rate");
	   
	// Y axis label:
	svg2.append("text")
	   .attr("text-anchor", "end")
	   .attr("transform", "rotate(-90)")
	   .attr("y", -margin.left + 20)
	   .attr("x", -margin.top - height/2 + 60)
	   .text("Life Expectancy (year)")	
	
	var circles = svg2.append("g")
					 .selectAll("circle")
					 .data(d)
					 .enter()
					 .append("circle")
					 .attr("r", 5)
					 .attr("cx", (d) => x(+d.FertRate))
					 .attr("cy", (d) => y(+d.LifeExpectancy))
					 .style("fill",function(d){return color(d.Region);})
					 .style("stroke", "#2F4F4F")
					 .style("stroke-width", 0.5)
					 .attr("class", "non_brushed");
					 
	function highlightBrushedCircles() {

		if (d3.event.selection != null) {

			// revert circles to initial style
			circles.attr("class", "non_brushed");

			var brush_coords = d3.brushSelection(this);

			// style brushed circles
			circles.filter(function (){

					   var cx = d3.select(this).attr("cx"),
						   cy = d3.select(this).attr("cy");

					   return isBrushed(brush_coords, cx, cy);
				   })
				   .attr("class", "brushed");
		}
	}

	function displayTable() {

		// disregard brushes w/o selections  
		// ref: http://bl.ocks.org/mbostock/6232537
		if (!d3.event.selection) return;

		// programmed clearing of brush after mouse-up
		// ref: https://github.com/d3/d3-brush/issues/10
		d3.select(this).call(brush.move, null);

		var d_brushed =  d3.selectAll(".brushed").data();

		// populate table if one or more elements is brushed
		if (d_brushed.length > 0) {
			clearTableRows();
			d_brushed.forEach(d_row => populateTableRow(d_row))
		} else {
			clearTableRows();
		}
	}

	var brush = d3.brush()
				  .on("brush", highlightBrushedCircles)
				  .on("end", displayTable); 
				  
	svg2.append("g")
	   .call(brush);
	   
	// Add legend for regions.
	svg2.selectAll("mydots")
	   .data(regions)
	   .enter()
	   .append("circle")
	   .attr("cx", 300)
	   .attr("cy", function(d,i){ return 27 + i*20}) // 100 is where the first dot appears. 25 is the distance between dots
	   .attr("r", 3)
	   .style("fill", function(d){ return color(d)})
	   .style("stroke", "black")
	   .style("opacity", 0.8);
	   
	svg2.selectAll("mylabels")
	   .data(regions)
	   .enter()
	   .append("text")
	   .attr("x", 310)
	   .attr("y", function(d,i){ return 30 + i*20}) // 100 is where the first dot appears. 20 is the distance between dots
	   .text(function(d){ return d})
	   .attr("text-anchor", "left")
	   .style("alignment-baseline", "bottom")
	   .style("font-size", "12px");


	
});
	
function clearTableRows() {

	hideTableColNames();
	d3.selectAll(".row_data").remove();
}

function isBrushed(brush_coords, cx, cy) {

	 var x0 = brush_coords[0][0],
		 x1 = brush_coords[1][0],
		 y0 = brush_coords[0][1],
		 y1 = brush_coords[1][1];

	return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
}


function hideTableColNames() {
    d3.select("table").style("visibility", "hidden");
}

function showTableColNames() {
    d3.select("table").style("visibility", "visible");
}

function populateTableRow(d_row) {

    showTableColNames();

    var d_row_filter = [d_row.Country, 
			            d_row.Region,
					    d_row.MedianAge
                        ];

    d3.select("#table")
      .append("tr")
	  .attr("class", "row_data")
	  .selectAll("td")
	  .data(d_row_filter)
	  .enter()
	  .append("td")
	  .attr("align", (d, i) => i == 0 ? "left" : "right")
	  .text(d => d)
	  .style("font-Family", "sans-serif")
	  .style("font-size", "14px")
	  .style("background-color",function(d){
									switch(d) {
									case regions[0]: return colorMap[0];break;
									case regions[1]: return colorMap[1];break;
									case regions[2]: return colorMap[2];break;
									case regions[3]: return colorMap[3];break;
									case regions[4]: return colorMap[4];break;
									case regions[5]: return colorMap[5];break;
									case regions[6]: return colorMap[6]; break;
								 
									}
								}
							
		            );
}
