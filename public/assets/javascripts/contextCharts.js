(function() {
    contextCharts = {}

    contextCharts.odm = function() {
        var margin = {top: 20, right: 20, bottom: 30, left: 30},
            width = 700 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        var parseDate = d3.time.format("%Y").parse;

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSubdivide(1)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.rmm); });

        var svg = d3.select("#odm-linechart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.csv("/assets/data/odm.csv", function(data) {
            data.forEach(function(d) {
                d.year = parseDate(d.year);
                d.rmm = d.rmm/10;
            });

            x.domain([parseDate("1990"), parseDate("2015")]);
            y.domain([0,6]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .append("text")
                .attr("y",-10)
                .attr("x", width)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Año");

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("RMM");

            svg.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", line);

            svg.selectAll("circle.point")
                .data(data)
                .enter().append("circle")
                .classed("point", true)
                .attr("cx", function(d) { return x(d.year); })
                .attr("cy", function(d) { return y(d.rmm); })
                .attr("r", 3.5)

            svg.selectAll("text.pointLabels")
                .data(data)
                .enter().append("text")
                .classed("pointLabels", true)
                .attr("x", function(d) { return x(d.year) + 6;  })
                .attr("y", function(d) { return y(d.rmm) + 6;  })
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(function(d) { return parseFloat(d.rmm).toFixed(1) });

            // Projection 2015
            var projection2015 = [
                { year: parseDate("2011"), rmm: 4.0 },
                { year: parseDate("2015"), rmm: 4.26 }
            ];

            svg.append("path")
                .datum(projection2015)
                .classed("projection2015", true)
                .attr("d", line)
                .style("stroke-dasharray", ("3, 3"));

            svg.append("circle")
                .datum(projection2015[1])
                .classed("point", true)
                .attr("cx", function(d) { return x(d.year); })
                .attr("cy", function(d) { return y(d.rmm); })
                .attr("r", 3.5);

            svg.append("text")
                .datum(projection2015[1])
                .classed("pointLabels", true)
                .attr("x", function(d) { return x(d.year) + 6;  })
                .attr("y", function(d) { return y(d.rmm) + 6;  })
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(function(d) { return parseFloat(d.rmm).toFixed(1) });

            // Path ODM
            var pathODM = [
                { year: parseDate("2011"), rmm: 4.0 },
                { year: parseDate("2015"), rmm: 1.3 }
            ];

            svg.append("path")
                .datum(pathODM)
                .classed("pathODM", true)
                .attr("d", line)
                .style("stroke-dasharray", ("3, 3"));

            svg.append("circle")
                .datum(pathODM[1])
                .classed("pointODM", true)
                .attr("cx", function(d) { return x(d.year); })
                .attr("cy", function(d) { return y(d.rmm); })
                .attr("r", 3.5);

            svg.append("text")
                .datum(pathODM[1])
                .classed("pointLabels", true)
                .classed("odm", true)
                .attr("x", function(d) { return x(d.year) + 6;  })
                .attr("y", function(d) { return y(d.rmm) + 6;  })
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(function(d) { return parseFloat(d.rmm).toFixed(1) });

            svg.append("text")
                .datum(pathODM[1])
                .classed("odm", true)
                .attr("x", function(d) { return x(d.year) + 6;  })
                .attr("y", function(d) { return y(d.rmm) + 16;  })
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Cumplimiento ODM");

        });
    }
})()