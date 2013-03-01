(function() {
    contextCharts = {}

    var margin = {top: 20, right: 20, bottom: 50, left: 30},
        width = 700 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

    contextCharts.odm = function() {
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
                .text("Año")

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .append("text")
                .attr("y", 25)
                .attr("x", width-150)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Fuente: OSSyR en base a datos de la DEIS. Ministerio de Salud de la Nación, 2012");

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("RMM");

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
        });
    }

    contextCharts.rank = function() {
        var y = d3.scale.ordinal()
            .rangeRoundBands([0, height], .1);

        var x = d3.scale.linear()
            .range([0, width]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(0)
            .orient("left");

        var marginLeft = 100;
        var svg = d3.select("#rank-barchart").append("svg")
            .attr("width", width + marginLeft + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + marginLeft + "," + margin.top + ")");

        d3.csv("/assets/data/rank.csv", function(data) {

            data.sort(function(a, b) {
                return b.rmm - a.rmm;
            })

            x.domain([0, 14]);
            y.domain(data.map(function(d) { return d.region; }));

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .append("text")
                .attr("y",-10)
                .attr("x", width)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("RMM");

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .append("text")
                .attr("y", 25)
                .attr("x", width/2 + 50)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Fuente: DEIS 2012");

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .classed("bar", true)
                .classed("nation", function(d) { return d.region == "País" })
                .attr("x", 0)
                .attr("width", function(d) { return x(d.rmm) })
                .attr("y", function(d) { return y(d.region); })
                .attr("height", y.rangeBand());

            svg.selectAll(".pointLabels")
                .data(data)
                .enter().append("text")
                .classed("pointLabels", true)
                .classed("nation", function(d) { return d.region == "País" })
                .attr("x", function(d) { return x(d.rmm) + 6;  })
                .attr("y", function(d) { return y(d.region) + 1;  })
                .attr("dy", ".71em")
                .style("text-anchor", "start")
                .text(function(d) { return parseFloat(d.rmm).toFixed(1) });
        });
    }
})()