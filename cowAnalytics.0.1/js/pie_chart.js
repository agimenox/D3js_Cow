const URL_DATASET_PIE = "../dataset/process_data.csv";
const URL_DATASET_PIE_2 = "../dataset/process_data2.csv";
function pie() {

    const svg = d3.select('svg'),
    width = svg.attr('width'),
	height = svg.attr('height'),
	radius = Math.min(width, height) / 2.5;
    
	var g = svg.append('g')
			.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');


    const color = d3.scaleOrdinal(d3.schemeCategory10);

    var pie = d3.pie()
        .value(d => d.value);


    // Create an arc generator
    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var label = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius - 150);

    d3.csv(URL_DATASET_PIE).then(
        function(data) {

        var arcs = g.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

        arcs.append("path")
        .attr("d", arc)
        .style("fill", (d, i) => color(i));

        arcs.append("text")
        .attr("class", "arc-text")
        .attr("transform", d => `translate(${label.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(d => d.data.value);
        //.text(d => `${d.data.category}: ${d.data.value}`);
        svg.append('g')
        .attr('transform', 'translate(' + (width / 2 - 60) + ',' + 20 + ')')
        .append('text')
        .text('PPM Averages Dataset 1')
        .attr('class', 'title')
        .attr("font-size", "24px")
        
   

    }
    )
}


function pie2() {

    const svg = d3.select('#pie2'),
    width = svg.attr('width'),
	height = svg.attr('height'),
	radius = Math.min(width, height) / 2.5;
	var g = svg.append('g')
			.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');


    const color = d3.scaleOrdinal(d3.schemeCategory10);

    var pie = d3.pie()
        .value(d => d.value);


    // Create an arc generator
    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var label = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius - 150);

    d3.csv(URL_DATASET_PIE_2).then(
        function(data) {

        var arcs = g.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

        arcs.append("path")
        .attr("d", arc)
        .style("fill", (d, i) => color(i));

        arcs.append("text")
        .attr("class", "arc-text")
        .attr("transform", d => `translate(${label.centroid(d)})`)
        .attr("dy", "0.1em")
        .text(d => d.data.name);
        svg.append('g')
        .attr('transform', 'translate(' + (width / 2 - 50) + ',' + 20 + ')')
        .append('text')
        .text('PPM Averages Dataset 2')
        .attr('class', 'title')
        .attr("font-size", "24px")

    }
    )
}
