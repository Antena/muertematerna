(function() {
    provinceMap = {};

    var map;
    var width=280, height=300;
    var colorGorup = "Blues";
    var legend;

    provinceMap.init = function() {
        this.drawLegend();

        d3.select("#province-map").append("svg")
            .attr("id", "provinceMapCanvas")
            .attr("width", width)
            .attr("height", height)
    }

    provinceMap.drawLegend = function() {
        var formatNumber = d3.format(".0f");

        var threshold = d3.scale.threshold()
            .domain([1, 2, 3, 4, 5, 6])
            .range(colorbrewer[colorGorup][6]);

        // A position encoding for the key only.
        var x = d3.scale.linear()
            .domain([0, 6])
            .range([0, 240]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(13)
            .tickValues(threshold.domain())
            .tickFormat(function(d) { return formatNumber(d-1); });

        var svg = d3.select("#province-map").append("svg")
            .attr("width", 280)
            .attr("height", 50);

        legend = svg.append("g")
            .attr("class", "key")
            .attr("transform", "translate(15,20)");

        legend.selectAll("rect")
            .data(threshold.range().map(function(d, i) {
                return {
                    x0: i ? x(threshold.domain()[i - 1]) : x.range()[0],
                    x1: i < 4 ? x(threshold.domain()[i]) : x.range()[1],
                    z: d
                };
            }))
            .enter().append("rect")
            .attr("height", 8)
            .attr("x", function(d) { return d.x0; })
            .attr("width", function(d) { return d.x1 - d.x0; })
            .style("fill", function(d) { return d.z; });

        legend.call(xAxis).append("text")
            .attr("class", "caption")
            .attr("y", -6)
            .text("Cantidad de muertes maternas por departamento");
    }

    provinceMap.update = function() {
        // Color group
        var newcolorGroup = app.selection.cause ? app.selection.cause.colorGroup : "Blues";
        if (newcolorGroup != colorGorup) {
            colorGorup = newcolorGroup;
            this.recolorLegend();
        }

        var province = app.selection.province;
        var svg = d3.select("#provinceMapCanvas");
        var theMap = svg.select(".provinceMap");
        if (theMap.empty()) {
            this.draw(province);
        } else if (svg.select("#province-" + province.value).empty()) {
            theMap.remove();
            this.draw(province);
        } else {
            this.recolorMap();
        }
    }

    provinceMap.recolorMap = function() {
        // The filtered data
        var departmentData = filterPieCharts.doAggregation(function(d) {
            return d.department;
        }, "departamento", true);

        map.selectAll(".department")
            .style("fill", function(d) {
                if (!departmentData) {
                    return colorbrewer[colorGorup]['6'][0];
                }
                var departmentId = d.properties.ID_2;
                var theDepartment = departmentData.filter(function(datum) { return datum.key == departmentId});
                var deaths = theDepartment.length > 0 ? theDepartment[0].values.length : 0;
                return colorbrewer[colorGorup]['6'][deaths];
            });
    }

    provinceMap.recolorLegend = function() {
        legend.selectAll("rect")
            .style("fill", function(d, i) {
                return colorbrewer[colorGorup][6][i];
            });
    }

    provinceMap.draw = function(province) {
        var svg = d3.select("#provinceMapCanvas");

        // Sidebar title
        $(".id-provinceName").text(province.key);

        // The filtered data
        var departmentData = filterPieCharts.doAggregation(function(d) {
            return d.department;
        }, "departamento", true);

        // Draw the map
        d3.json("/assets/data/" + province.departments.file, function(error, theProvince) {
            var departments = topojson.object(theProvince, theProvince.objects.departments);
            var projection = d3.geo.mercator()
                .scale(province.departments.scale)
                .center(province.departments.center)
                .translate([width / 2, height / 2]);
            var path = d3.geo.path()
                .projection(projection)
                .pointRadius(3);

            map = svg.append("g")
                .attr("id", "province-" + province.value)
                .classed("provinceMap", true);

            map.selectAll(".department")
                .data(departments.geometries)
                .enter().append("path")
                .attr("class", "department")
                .attr("d", path)
                .style("fill", function(d) {
                    if (!departmentData) {
                        return colorbrewer[colorGorup]['6'][0];
                    }
                    var departmentId = d.properties.ID_2;
                    var theDepartment = departmentData.filter(function(datum) { return datum.key == departmentId});
                    var deaths = theDepartment.length > 0 ? theDepartment[0].values.length : 0;
                    return colorbrewer[colorGorup]['6'][deaths];
                })
                .tooltip(function(d,i) {
                    var content = $("<div></div>")
                        .append("<p>" + d.properties.NAME_2 + " (" + d.properties.ID_2 + ")</p>")

                    return {
                        class: "departmentTooltip",
                        type: "mouse",
                        content: content.html(),
                        displacement: [0, 10]
                    };
                });

            //TODO(gb): fix this. just for Santa Fe for now.
            if (province.value == 21) {
                map.selectAll(".place-label")

                    .data(topojson.object(theProvince, theProvince.objects.maternidades).geometries)
                    .enter().append("circle")
                    .attr("class", "place")
                    .attr("r", 3)
                    .attr("transform", function(d) { return "translate(" + projection(d.coordinates.reverse()) + ")"; })
                    .tooltip(function(d,i) {
                        var content = $("<div></div>")
                            .append("<p>" + d.properties.NAME + "</p>");

                        return {
                            class: "medicalCenterTooltip",
                            type: "mouse",
                            content: content.html(),
                            displacement:[0,10]
                        }
                    })

            }
        });
    }
})()