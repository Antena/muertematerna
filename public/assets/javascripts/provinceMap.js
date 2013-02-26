(function() {
    provinceMap = {};

    var map, path, projection, zoom;
    var width=280, height=300;
    var colorGorup = "Blues";
    var legend;
    var coneTypes = [], allConeTypes = [];

    provinceMap.init = function() {
        this.drawLegend();
        this.initFilter();

        d3.select("#province-map").append("svg")
            .attr("id", "provinceMapCanvas")
            .attr("width", width)
            .attr("height", height)
    }

    provinceMap.initFilter = function() {
        var self = this;
        var theChecks = $("#province-map-filter input[type=checkbox]");

        // The radios
        $("#province-map-filter input[type=radio]").change(function() {
            var val = $(this).val();
            if (val == "showFiltered") {
                theChecks.removeAttr("disabled");
                self.showFilteredHealthcareCenters();
            }
            if (val == "showAll") {
                theChecks.attr("disabled", true);
                self.showAllHealthcareCenters();
            }
            if (val == "showFullCompliant") {
                theChecks.attr("disabled", true);
                self.showFullCompliantHealthcareCenters();
            }
        });

        // The checks
        theChecks
            .each(function() {
                coneTypes.push($(this).attr("id"));
                allConeTypes.push($(this).attr("id"));
            })
            .change(function() {
                if (!$(this).is(":checked")) {
                    var indexOf = coneTypes.indexOf($(this).attr("id"));
                    coneTypes.splice(indexOf,    1);
                } else {
                    coneTypes.push($(this).attr("id"))
                }
                self.showFilteredHealthcareCenters();
            });
    }

    provinceMap.showAllHealthcareCenters = function() {
        map.selectAll(".place").style("display", "inline");
    }

    provinceMap.showFullCompliantHealthcareCenters = function() {
        map.selectAll(".place")
            .style("display", function(d) {
                var show = true;
                allConeTypes.map(function(type) {
                    show = show && (d.properties[type] == true)
                });
                return show ? "inline" : "none";
            });
    }

    provinceMap.showFilteredHealthcareCenters = function() {
        map.selectAll(".place")
            .style("display", function(d) {
                var show = coneTypes.length == 0 ? true : false;
                coneTypes.map(function(type) {
                    if ((d.properties[type] == false)) {
                        show = true;
                    }
                });
                return show ? "inline" : "none";
            });
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
            projection = d3.geo.mercator()
                .scale(province.departments.scale)
                .center(province.departments.center)
                .translate([width / 2, height / 2]);
            path = d3.geo.path()
                .projection(projection);

            var zoom = d3.behavior.zoom()
                .translate(projection.translate())
                .scaleExtent([height, Infinity])
                .scale(projection.scale())
                .on("zoom", function() {
                    projection.translate(d3.event.translate).scale(d3.event.scale)
                    map.selectAll(".department.zoomable").attr("d", path);
                });


            map = svg.append("g")
                .attr("id", "province-" + province.value)
                .classed("provinceMap", true)
//                .call(zoom);

            map.append("rect")
                .attr("class", "background")
                .attr("width", width)
                .attr("height", height);

            map.selectAll(".department")
                .data(departments.geometries)
                .enter().append("path")
                .classed("department", true)
                .classed("zoomable", true)
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
                        .append("<p>" + d.properties.NAME_2 + "</p>")

                    return {
                        class: "departmentTooltip",
                        type: "mouse",
                        content: content.html(),
                        displacement: [0, 15]
                    };
                });

            if (theProvince.objects.maternidades) {
                map.selectAll(".place-label")
                    .data(topojson.object(theProvince, theProvince.objects.maternidades).geometries)
                    .enter().append("path")
                    .classed("place", true)
                    .classed("zoomable", true)
                    .attr("d", d3.svg.symbol().type("cross"))
                    .attr("transform", function(d) { return "translate(" + projection(d.coordinates.reverse()) + ")"; })
                    .tooltip(function(d,i) {
                        var content = $("<div></div>")
                            .append("<p>\u271A " + d.properties.Establecimiento_nombre + "</p>");
                        var gravity = d.coordinates[0] < province.departments.center[0] ? "left" : "right";
                        var displacement = gravity == "left" ? [-5,0] : [5,0];
                        return {
                            class: "healthcareTooltip",
                            type: "fixed",
                            gravity: gravity,
                            content: content.html(),
                            displacement: displacement
                        }
                    })

            }
        });
    }
})()