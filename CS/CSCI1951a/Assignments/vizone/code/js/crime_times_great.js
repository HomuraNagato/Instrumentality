	var margin = { top: 50, right: 0, bottom: 100, left: 30 },
		width = 960 - margin.left - margin.right,
		height = 430 - margin.top - margin.bottom, //
		gridSize = Math.floor(width / 24),
		yOffset = 20,
		xOffset = 30,
		legendElementWidth = gridSize*2,
		buckets = 9,
		colors = ["#ffe6e6","#ffcccc","#ffb3b3","#ff9999","#ff8080","#ff6666","#ff3333","#ff0000","#cc0000"], // alternatively colorbrewer.YlGnBu[9]
		days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
		times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"],
		dataFile = "js/data/data.tsv";

	  var svg = d3.select("#chart").append("svg")
		  .attr("width", width + margin.left + margin.right)
		  .attr("height", height + margin.top + margin.bottom)
		  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	  var dayLabels = svg.selectAll(".dayLabel")
		  .data(days)
		  .enter().append("text")
			.text(function (d) { return d; })
			.attr("x", 0)
			.attr("y", function (d, i) { return i * gridSize + yOffset*2; })
			.attr("width", gridSize)
			.attr("font-family", "Arial")
			.attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

	  var timeLabels = svg.selectAll(".timeLabel")
		  .data(times)
		  .enter().append("text")
			.text(function(d) { return d; })
			.attr("x", function(d, i) { return i * gridSize + xOffset; })
			.attr("y", yOffset)
			.style("text-anchor", "middle")
			.attr("font-family", "Arial")
			.attr("transform", "translate(" + gridSize / 2 + ", -6)")
			.attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

	  var heatmapChart = function(tsvFile) {
		d3.tsv(tsvFile,
		function(d) {
		  return {
			day: +d.day,
			hour: +d.hour,
			value: +d.value
		  };
		},
		function(error, data) {
		  var colorScale = d3.scale.quantile()
			  .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
			  .range(colors);

		  var cards = svg.selectAll(".hour")
			  .data(data, function(d) {return d.day+':'+d.hour;});

		  cards.append("title");

		  cards.enter().append("rect")
			  .attr("x", function(d) { return (d.hour - 1) * gridSize + xOffset; })
			  .attr("y", function(d) { return (d.day - 1) * gridSize + yOffset; })
			  .attr("rx", 4)
			  .attr("ry", 4)
			  .attr("class", "hour bordered")
			  .attr("width", gridSize)
			  .attr("height", gridSize)
			  .style("fill", colors[0]);

		  cards.transition().duration(1000)
			  .style("fill", function(d) { return colorScale(d.value); });

		  cards.select("title").text(function(d) { return d.value; });
		  
		  cards.exit().remove();

		  var legend = svg.selectAll(".legend")
			  .data([0].concat(colorScale.quantiles()), function(d) { return d; });

		  legend.enter().append("g")
			  .attr("class", "legend");

		  legend.append("rect")
			.attr("x", function(d, i) { return legendElementWidth * i + xOffset; })
			.attr("y", 300)
			.attr("width", legendElementWidth)
			.attr("height", gridSize / 2)
			.style("fill", function(d, i) { return colors[i]; });

		  legend.append("text")
			.attr("class", "mono")
			.text(function(d) { return "≥ " + Math.round(d); })
			.attr("x", function(d, i) { return legendElementWidth * i + yOffset + 20; })
			.attr("y", gridSize + 300)
			.attr("font-family", "Arial");

		  legend.exit().remove();

		});  
	  };

	  heatmapChart(dataFile);