
//Variables declaration
const CHART_1 = "#chart1";
const CHART_2 = "#chart2";
const URL_DATASET_BAR = "../dataset/created_data.csv";
const AXIS_X_PER_DAY = "animal_id";
const AXIS_X_PER_COW = "hour"
const AXIS_Y = "total_ppm_animal";


//Methods

function total_ppm_per_day(measureDay) {
	if (measureDay == null) {
		return;
	}

	d3.csv(URL_DATASET_BAR)
		.then(function (data) {
			// This callback runs when the CSV data is loaded
			const dataset = transform_data_yy_mm_dd(data);
			return dataset.filter(entry => entry.date === measureDay);
		})
		.then(function (cowData) {
			console.log(cowData)
			restart_chart(CHART_1);
			createBarChart(CHART_1, "Methane PPM on " + measureDay, cowData, AXIS_X_PER_DAY, AXIS_Y);
		})
		.catch(function (error) {
			console.error(error);
		});
}

function total_ppm_per_cow() {
	var cowId = document.getElementById("cowValue").value;
	var measureDay = document.getElementById("calendarBarCow").value;
	console.log(measureDay);
	console.log(cowId);
	if (cowId == null) {
		return;
	}


	d3.csv(URL_DATASET_BAR)
		.then(function (data) {
			console.log(data);
			// This callback runs when the CSV data is loaded
			const dataset = transform_data_yy_mm_dd(data);
			return dataset.filter(entry => entry.animal_id === cowId)
			.filter(entry => entry.date === measureDay);
		})
		// .then(function (data) {
		// 	return transform_data_yy_mm_dd(data);
		// })
		// .then(function (data) {
		// 	//This callback runs when the CSV data is loaded
		// 	console.log(data)
		// 	setHours = transform_date_to_hour(data);
		// 	console.log(setHours);
		// 	return setHours;
		// })
		.then(function (cowData) {
			console.log(cowData)
			restart_chart(CHART_2);
			createBarChart(CHART_2, "Methane PPM Cow " + cowId, cowData, AXIS_X_PER_COW, AXIS_Y);
		})
		.catch(function (error) {
			console.error(error);
		});


	// get_filter_by_id(URL_DATASET_BAR, cowId).then(function (cowData) {
	// 	restart_chart(CHART_2);
	// 	createBarChart(CHART_2, "Methane PPM Cow " + cowId, cowData, "date", "value");
	// });
}

function transform_data_yy_mm_dd(data) {
	return data.map(entry => ({
		...entry,
		total_ppm_animal: entry.peak_with_animal_ppm - entry.ambient_baseline_ppm,
		date:date_to_yy_mm_dd(entry.sample_start_time),
		hour:get_hour(entry.sample_start_time)
	}));
}

function transform_date_to_ddmmyyyyhhmm(data) {
	return data.map(entry => ({
		...entry,
		sample_start_time: date_to_ddmmyyyyhhmm(entry.sample_start_time),
		total_ppm_animal: entry.peak_with_animal_ppm - entry.ambient_baseline_ppm
	}));
}

function transform_date_to_hour(data) {
	return data.map(entry => ({
		...entry,
		sample_start_time: get_hour(entry.sample_start_time),
		total_ppm_animal: entry.peak_with_animal_ppm - entry.ambient_baseline_ppm
	}));
}


function restart_chart(chart_id) {
	d3.select(chart_id).selectAll("*").remove();
}

function createBarChart(chartId, title, data, xKey, yKey) {

	const svg = d3.select(chartId),
		margin = 150,
		width = svg.attr("width") - margin,
		height = svg.attr("height") - margin;

	svg.append("text")
		.attr("transform", "translate(100,0)")
		.attr("x", 50)
		.attr("y", 50)
		.attr("font-size", "24px")
		.text(title);

	var xScale = d3.scaleBand().range([0, width]).padding(0.4),
		yScale = d3.scaleLinear().range([height, 0]);

	xScale.domain(data.map(function (d) {
		return d[xKey];
	}));
	yScale.domain([0, d3.max(data, function (d) { return d[yKey]; })]);

	var g = svg.append("g")
		.attr("transform", "translate(" + 100 + "," + 100 + ")");

	g.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale))
		.append("text")
		.attr("y", height - 250)
		.attr("x", width - 100)
		.attr("text-anchor", "end")
		.attr("stroke", "black")
		.text("Value");

	g.append("g")
		.call(d3.axisLeft(yScale).tickFormat(function (d) { return "" + d; }).ticks(5))
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 10)
		.attr('dy', '-7em')
		.attr('text-anchor', 'end')
		.attr('stroke', 'green')
		.text('PPM Values');

	g.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.on("mouseover", onMouseOver)
		.on("mouseout", onMouseOut)
		.attr("x", function (d) { return xScale(d[xKey]); })
		.attr("y", function (d) { return yScale(d[yKey]); })
		.attr("width", xScale.bandwidth())
		.transition()
		.ease(d3.easeLinear)
		.duration(2000)
		.delay(function (d, i) { return i * 50 })
		.attr("height", function (d) { return height - yScale(d[yKey]); });

	function onMouseOver(d, i) {
		var xPos = parseFloat(d3.select(this).attr('x')) + xScale.bandwidth() / 2;
		var yPos = parseFloat(d3.select(this).attr('y')) / 2 + height / 2;

		d3.select('#tooltip')
			.style('left', xPos + 'px')
			.style('top', yPos + 'px')
			.select('#value').text(i[yKey]);

		d3.select('#tooltip').classed('hidden', false);

		d3.select(this).attr('class', 'highlight')
			.transition()
			.duration(500)
			.attr('width', xScale.bandwidth() + 5)
			.attr('y', function (d) { return yScale(d[yKey]); })
			.attr('height', function (d) { return height - yScale(d[yKey]); });
	}

	function onMouseOut(d, i) {
		d3.select(this).attr('class', 'bar')
			.transition()
			.duration(500)
			.attr('width', xScale.bandwidth())
			.attr('y', function (d) { return yScale(d[yKey]); })
			.attr('height', function (d) { return height - yScale(d[yKey]); });

		d3.select('#tooltip').classed('hidden', true);
	}
}

