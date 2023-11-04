const URL_DATASET_EMITED = "../dataset/created_data.csv";

function get_filter_data_day(url, measureDay) {
	return d3.csv(url, (data) => {
		// Assuming the date format is consistent, you can check for "Nov 02" in the date string
		if (data.sample_start_time.includes(measureDay)) {
			return data;
      
		}
	});
}
//2
function format_date(date){
  const dateObj = new Date(date + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US').format(dateObj);

}

//1
function emitted_ppm_day(measureDay){
  if (measureDay == undefined) {
		return;
  }
  get_filter_data_day(URL_DATASET_EMITED,format_date(measureDay))
  .then(function(cow_data){
  console.log(cow_data);

  // Set dimensions and margins for the chart
  const margin = { top: 70, right: 30, bottom: 40, left: 80 };
  const width = 1200 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Set up the x and y scales
  const x = d3.scaleTime()
    .range([0, width]);

  const y = d3.scaleLinear()
    .range([height, 0]);

  // Set up the line generator
  const line = d3.line()
    .x(d => x(d.enter_time))
    .y(d => y(d.peak_with_animal_ppm - d.ambient_baseline_ppm));


  // Create the SVG element and append it to the chart container
  d3.select("#chart-container3").selectAll("*").remove();
  const svg = d3.select("#chart-container3")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // create tooltip div

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

  // Load and process the data
    // Parse the date and convert the peak_with_animal_ppm to a number
    const parseDate = d3.timeParse("%m/%d/%Y %H:%M");
    cow_data.forEach(d => {
      var dateSampel = date_to_mmddyyyyhhmm(d.enter_time);
      d.enter_time = parseDate(dateSampel);
      d.peak_with_animal_ppm = +d.peak_with_animal_ppm;
    });
    
    cow_data.sort((a, b) => a.enter_time - b.enter_time);
    // Set the domains for the x and y scales
    x.domain(d3.extent(cow_data, d => d.enter_time));
    y.domain([0, d3.max(cow_data, d => d.peak_with_animal_ppm)]);

    // Add the x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .style("font-size", "14px")
      .call(d3.axisBottom(x)
        .tickValues(x.ticks(d3.timeHour.every(1))) // Display ticks every 6 months
        .tickFormat(d3.timeFormat("%I:%M %p"))) // Format the tick labels to show Month and Year
      //.call(g => g.select(".domain").remove()) // Remove the x-axis line
      .selectAll(".tick line") // Select all tick lines
      .style("stroke-opacity", 0)
    svg.selectAll(".tick text")
      .attr("fill", "#777");

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

    // Add the y-axis
    svg.append("g")
      .style("font-size", "14px")
      .call(d3.axisLeft(y)
        .ticks((d3.max(cow_data, d => d.peak_with_animal_ppm - d.ambient_baseline_ppm) - 2000) / 100)
        .tickFormat(d => {
          if (isNaN(d)) return "";
          return `${(d / 1000).toFixed(0)}k`;
        })
        .tickSize(0)
        .tickPadding(10))
      //.call(g => g.select(".domain").remove()) // Remove the y-axis line
      .selectAll(".tick text")
      .style("fill", "#777") // Make the font color grayer
      .style("visibility", (d, i, nodes) => {
        if (i === 0) {
          return "hidden"; // Hide the first and last tick labels
        } else {
          return "visible"; // Show the remaining tick labels
        }
      });

    // Add Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#777")
      .style("font-family", "sans-serif")
      .text("Methane per Visit");

    // Add horizontal gridlines
    svg.selectAll("yGrid")
      .data(y.ticks((d3.max(cow_data, d => d.peak_with_animal_ppm) - 1000) / 5000).slice(1))
      .join("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", .5)

    // Add the line path
    svg.append("path")
      .datum(cow_data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Add a circle element

    const circle = svg.append("circle")
      .attr("r", 0)
      .attr("fill", "steelblue")
      .style("stroke", "white")
      .attr("opacity", .70)
      .style("pointer-events", "none");
    // create a listening rectangle

    const listeningRect = svg.append("rect")
      .attr("width", width)
      .attr("height", height);

    // create the mouse move function

    listeningRect.on("mousemove", function (event) {
      const [xCoord] = d3.pointer(event, this);
      const bisectDate = d3.bisector(d => d.enter_time).left;
      const x0 = x.invert(xCoord);
      const i = bisectDate(cow_data, x0, 1);
      const d0 = cow_data[i - 1];
      const d1 = cow_data[i];
      const d = x0 - d0.enter_time > d1.enter_time - x0 ? d1 : d0;
      const xPos = x(d.enter_time);
      const yPos = y(d.peak_with_animal_ppm - d.ambient_baseline_ppm);


      // Update the circle position

      circle.attr("cx", xPos)
        .attr("cy", yPos);

      // Add transition for the circle radius

      circle.transition()
        .duration(50)
        .attr("r", 5);

      // add in  our tooltip

      tooltip
        .style("display", "block")
        .style("left", `${xPos + 100}px`)
        .style("top", `${yPos + 50}px`)
        .html(`<strong>Visit:</strong> ${d.enter_time}<br><strong>Methane Emited:</strong> ${d.peak_with_animal_ppm !== undefined ? (d.peak_with_animal_ppm - d.ambient_baseline_ppm).toFixed(0) + ' PPM' : 'N/A'}`)
    });
    // listening rectangle mouse leave function

    listeningRect.on("mouseleave", function () {
      circle.transition()
        .duration(50)
        .attr("r", 0);

      tooltip.style("display", "none");
    });

    // Add the chart title
    svg.append("text")
      .attr("class", "chart-title")
      .attr("x", margin.left - 115)
      .attr("y", margin.top - 100)
      .style("font-size", "24px")
      //.style("font-weight", "bold")
      .style("font-family", "sans-serif")
      .text("Methane emitted per visit");

    // Add the source credit
    svg.append("text")
      .attr("class", "source-credit")
      .attr("x", width - 1125)
      .attr("y", height + margin.bottom - 3)
      .style("font-size", "9px")
      .style("font-family", "sans-serif")
      .text("Agri Data Analytics Ireland");

});

}

