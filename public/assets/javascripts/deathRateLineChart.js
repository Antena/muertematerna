(function() {
    deathRateLineChart = {
        options : {
            width : 202,
            height : 180,
            margin : {top: 20, right: 20, bottom: 30, left: 50}
        }
    }

    deathRateLineChart.draw = function(containerId, customOptions) {
        var self = this;

        $.extend(true, self.options, customOptions);

        var width = self.options.width - self.options.margin.left - self.options.margin.right,
            height = self.options.height - self.options.margin.top - self.options.margin.bottom;

        var x = d3.scale.linear()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(5)
            .tickFormat(d3.format("0f"));

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .interpolate("linear")
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.rate); });

        var svg = d3.select("#"+containerId).append("svg")
            .attr("width", width + self.options.margin.left + self.options.margin.right)
            .attr("height", height + self.options.margin.top + self.options.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + self.options.margin.left + "," + self.options.margin.top + ")");

        x.domain(d3.extent(app.nationalRates, function(d) { return d.year; }));
        y.domain([3,6]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end");

        svg.append("path")
            .datum(app.nationalRates)
            .attr("class", "line")
            .attr("d", line);
    }
})()
