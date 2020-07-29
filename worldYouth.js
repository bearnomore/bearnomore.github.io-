//For first plot
//Define the size of the svg where the first chart is plotted
var w = 800;
var h = 600;

var margin = {top: 50, bottom: 50, left: 20, right: 20};
var width = w - margin.left - margin.right;
var height = h - margin.top - margin.bottom;

// Define the map projection
var projection = d3.geoMercator() //for the world map projection
                   .translate([w/2, h/2]) // centerize the map
		           .center([0,20])
                   .scale([140]);

//Define default path generator
var path = d3.geoPath()
             .projection(projection);

var svg = d3.select("#viz1")
            .append("svg")
            .attr("id", "chart")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("tranform", "translate(0" + margin.left + "," + margin.top + ")");

      
//Read data of the world_profile20 and add variables to the geographic data 
d3.csv("https://raw.githubusercontent.com/bearnomore/CS498Visualization/master/world_profile20.csv", function(data){

    var colorScale = d3.scaleThreshold()
                       .domain([20, 30, 35, 40, 45]) // define 5 thresholds of age groups
                       .range(["#adebad", "#70db70", "#33cc33", "#248f24", "#145214", "#0a290a" ]);

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", function(json){

        //Merge the meidanAge and GeoJSON data
        //Loop through once for each MedianAge data value
        for(var i = 0; i < data.length; i++){
          // grab country code 
          var dataCode = data[i].Code;

          //grab data value, and convert from string to float
          var dataAge = parseFloat(data[i].MedianAge);

          //find the corresponding country inside the GeoJSON through the same country code
          for(var n = 0; n < json.features.length; n++){

            // find the country code (the value of the "id") in geoJson data
            var jsonCode = json.features[n].id;
            // if the country codes from the two datasets are the same, add the value of madian age to the properties of geoJason data
            if(dataCode == jsonCode){
              // like creating a new value column in JSON data
              json.features[n].properties.medianAge = dataAge;

              //stop looking through the JSON
              break;
            }
          }
        }
		
        // Make a tooltip
		var tooltip = d3.select("#viz1")
                        .append("div")
                        .style("opacity", 0)
                        .attr("class", "tooltip")
                        .style("background-color", "white")
                        .style("border", "black")
                        .style("border-width", "1px")
                        .style("border-radius", "5px")
                        .style("padding", "5px")
						.style("font-size", "16px");
	
        // A function that change this tooltip when the user hover a point.
        // Its opacity is set to 1 for us to see it. Plus it set the text and position of tooltip depending on the datapoint (d)
        var mouseover = function(d) {
			                          var value = d.properties.medianAge;
									  var country = d.properties.name;
									  
			                          d3.select(this).style("fill", "yellow").transition().duration(300).style("opacity", 1);
									  tooltip.transition()
									         .duration(300)
                                             .style("opacity", 1);
									  tooltip.text("Median Age of " + country + ":"+value)
									         .style("left", (d3.event.pageX) + "px") 
                                             .style("top", (d3.event.pageY) + "px");
											 
		}
										
	

        // A function that change this tooltip when the leaves a point by setting the opacity to 0 again
		
        var mouseleave = function(d) {
			                          var value = d.properties.medianAge;
                                      tooltip.transition()
                                             .duration(300)
                                             .style("opacity", 0);
								      
		                              d3.select(this).style("fill", value? colorScale(value):"#ccc");
                                     } 
		
		
        svg.selectAll("path")
           .data(json.features)
           .enter()
           .append("path")
           .attr("d", path)
		   .style("stroke", "black")
           .style("fill", function(d){
                                       //get the data value
                                       var value = d.properties.medianAge;

                                       if(value){
                                           //If value exists
                                           return colorScale(value);
                                        } 
									   else {
                                           // If value is undefined
                                           
                                           return "#ccc"
                                      }

                                    })
		  .on("mouseover", mouseover )
          .on("mouseleave", mouseleave );
		  
      });
	  
	  // Add legend
	  //create a new SVG in the body
	  /*
	  var legend = d3.legendColor().scale(colorScale);
	  svg.append("g")
         .attr("transform", "translate(20,400)")
         .call(legend);
	 */
	 
	 var legend = svg.selectAll("g.legend")
                     .data([0, 20, 30, 35, 40, 45])
                     .enter()
					 .append("g")
                     .attr("class", "legend");

     var ls_w = 20, ls_h = 20;
	 var legend_labels = ["< 20", "20-30", "30-35", "35-40", "40-45", "> 45"];
     var colors = ["#adebad", "#70db70", "#33cc33", "#248f24", "#145214", "#0a290a" ];	 
	 

     legend.append("rect")
           .attr("x", 20)
           .attr("y", function(d, i){ return h - (i*ls_h) - 2*ls_h - 15 ;})
           .attr("width", ls_w)
           .attr("height", ls_h)
           .style("fill", function(d, i) { return colors[i]; })
           .style("opacity", 0.8);
	
	 legend.append("text")
           .attr("x", 50)
           .attr("y", function(d, i){ return h - (i*ls_h) - 2*ls_h ;})
           .text(function(d, i){ return legend_labels[i]; });
})