const URL_DATASET_BASE = "../dataset/created_data.csv";

function get_filter_data_cowid(url, cowId) {
	return d3.csv(url, (data) => {
		// Assuming the date format is consistent, you can check for "Nov 02" in the date string
		if (data.animal_id === cowId) {
			return data;
		}
	});
}

function timechart(){
  var e = document.getElementById("SelectCowId");
  var value = e.value;
  
  get_filter_data_cowid(URL_DATASET_BASE, value)
  .then(function(data) {
    if (data == undefined) {
      return;
    }
    d3.select("#chart-container").selectAll("*").remove();
    
  
  const margin = { top: 70, right: 10, bottom: 40, left: 60 };
  const width = 1200 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  const colors = ["steelblue", "red", "green", "orange", "purple", "teal"];
  const colorScale = d3.scaleOrdinal().range(colors);
  
  
  // Set up the x and y scales
  
  const x = d3.scaleTime()
    .range([0, width]);
  
  const y = d3.scaleLinear()
    .range([height, 0]);
  

  
  // Create the SVG element and append it to the chart container
  
  const svg = d3.select("#chart-container")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");
  // // Load and Process Data
  
    // Parse the date and convert the population to a number
    const parseDate = d3.timeParse("%m/%d/%Y %H:%M");
    data.forEach(d => {
      var dateSampel = date_to_mmddyyyyhhmm(d.sample_start_time);
      d.sample_start_time = parseDate(dateSampel);
      d.base_with_animal_ppm = +d.base_with_animal_ppm;

      console.log(d.sample_start_time);
    });
  
    data.sort((a, b) => a.sample_start_time - b.sample_start_time);
    const filterCondition = (d) => d.animal_id === value;
    data = data.filter(filterCondition);
  

  // Define the x and y domains
  
  x.domain(d3.extent(data, d => d.sample_start_time));
  y.domain([0, d3.max(data, d => d.base_with_animal_ppm)]);
  
    // Add the x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .style("font-size", "8px")
      .call(d3.axisBottom(x)
        .tickValues(x.ticks(d3.timeDay.every(1))) 
        .tickFormat(d3.timeFormat("%b %Y"))) 
      .selectAll(".tick line") 
      .style("stroke-opacity", 0)
      svg.selectAll(".tick text")
      .attr("fill", "#777");
  
  
  // Add the y-axis
  svg.append("g")
  .style("font-size", "14px")
  .call(d3.axisLeft(y)
    .tickSize(0)
    .tickPadding(10))
  
  .selectAll(".tick text")
  .style("fill", "#777") 
  .style("visibility", (d, i, nodes) => {
    if (i === 0) {
      return "hidden"; 
    } else {
      return "visible"; 
    }
  });
  
   // Add vertical gridlines
   svg.selectAll("xGrid")
   .data(x.ticks().slice(1))
   .join("line")
   .attr("x1", d => x(d))
   .attr("x2", d => x(d))
   .attr("y1", 0)
   .attr("y2", height)
   .attr("stroke", "#e0e0e0")
   .attr("stroke-width", .5);
  
  // // Add horizontal gridlines
  
  svg.selectAll("yGrid")
  .data(y.ticks((d3.max(data, d => d.base_with_animal_ppm) - 1000) / 100).slice(1))
  .join("line")
  .attr("x1", 0)
  .attr("x2", width)
  .attr("y1", d => y(d))
  .attr("y2", d => y(d))
  .attr("stroke", "#e0e0e0")
  .attr("stroke-width", .5)
  
  // Create the line generator
  
  const line = d3.line()
    .x(d => x(d.sample_start_time))
    .y(d => y(d.base_with_animal_ppm));
  
  // Add the line path to the SVG element
  
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1)
    .attr("d", line);
  

  const circle = svg.append("circle")
    .attr("r", 0)
    .attr("fill", "steelblue")
    .style("stroke", "white")
    .attr("opacity", .70)
    .style("pointer-events", "none");

  const listeningRect = svg.append("rect")
    .attr("width", width)
    .attr("height", height);

  listeningRect.on("mousemove", function (event) {
    const [xCoord] = d3.pointer(event, this);
    const bisectDate = d3.bisector(d => d.sample_start_time).left;
    const x0 = x.invert(xCoord);
    const i = bisectDate(data, x0, 1);
    const d0 = data[i - 1];
    const d1 = data[i];
    const d = x0 - d0.sample_start_time > d1.sample_start_time - x0 ? d1 : d0;
    const xPos = x(d.sample_start_time);
    const yPos = y(d.base_with_animal_ppm);

  circle.attr("cx", xPos)
    .attr("cy", yPos);

  circle.transition()
    .duration(50)
    .attr("r", 5);

    tooltip
    .style("display", "block")
    .style("left", `${xPos + 100}px`)
    .style("top", `${yPos + 50}px`)
    .html(`<strong>Date:</strong> ${d.sample_start_time.toLocaleDateString()}<br><strong>PeakWithAnimalPPM:</strong> ${d.base_with_animal_ppm !== undefined ? (d.base_with_animal_ppm / 1).toFixed(0) + ' PPM' : 'N/A'}`)
});

listeningRect.on("mouseleave", function () {
  circle.transition()
    .duration(50)
    .attr("r", 0);

  tooltip.style("display", "none");
});
  // // Add Y-axis label
  

  
  svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("font-size", "14px")
  .style("fill", "#777")
  .style("font-family", "sans-serif")
  .text("Base With Animal PPM Peaks");
  
  // // Add the chart title
  
  svg.append("text")
  .attr("class", "chart-title")
  .attr("x", margin.left + 200)
  .attr("y", margin.top - 100)
  .style("font-size", "24px")
  .style("font-weight", "bold")
  .style("font-family", "sans-serif")
  .text("Average Peaks Per Cow");
    
  // // Add the source credit
  
  svg.append("text")
      .attr("class", "source-credit")
      .attr("x", width - 1125)
      .attr("y", height + margin.bottom - 3)
      .style("font-size", "9px")
      .style("font-family", "sans-serif")
      .text("Agri Data Analytics Ireland");
  
  });

}


