(function() {

    var layers = {};
    var g, path;
    var background, centered, zoomedGroup;
    var legend;

    d3choropleth = {
        version : "0.1",
        options : {
            width : 500,
            height : 800,
            scale : 6000,
            center : [-49, -56],
            dataType : 'json'
        }
    };

    d3choropleth.defaultColorGorup = "Blues";
    d3choropleth.currentColorGorup = "Blues";

    d3choropleth.map = function(containerDivId, customOptions) {
        var self = this;

        // Gather map options
        self.options.selector = '#' + containerDivId;
        self.container = $(self.options.selector);
        $.extend(self.options, customOptions);

        // Load map data
        if (self.options.dataType == 'json') {
            d3.json(self.options.dataUrl, function(error, topology) {
                self.fullTopology = topology;
                self.drawMap(self.fullTopology);
            })
        } else {
            throw 'The specified data type is not yet supported. Currently only supporting JSON data.'
        }
    };

    d3choropleth.drawMap = function(topology) {
        var self = this;

        // Map projection
        //TODO(gb): use albers equal-area projection instead !!!
        self.projection = d3.geo.mercator()
            .scale(self.options.scale)
            .center(self.options.center)
            .translate([self.options.width / 2, self.options.height / 2]);

        // Path
        path = d3.geo.path()
            .projection(self.projection);

        // Main SVG
        self.svg = d3.select(self.options.selector)
            .append("svg")
            .attr("width", self.options.width)
            .attr("height", self.options.height);

        // Map background
        background = self.svg.append("rect")
            .attr("class", "background")
            .attr("width", self.options.width)
            .attr("height", self.options.height)
            .on("click", function(d) {
                d3choropleth.zoomOut();
            });

        // Map layers
        for (name in self.options.layers) {
            self.addLayer(name, topology.objects[name]);
        }

        // Map legend
        var legendColors = d3.scale.ordinal()
            .range(colorbrewer.Blues[4]);

        legend = self.svg
            .append("g")
            .attr("id", "legend")
            .attr("transform", "translate(0," + (self.options.height - 4 * 20) + ")")
            .selectAll(".legend-box")
            .data(colorbrewer.Blues[4])
            .enter().append("g")
            .attr("class", "legend-box")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", self.options.width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", legendColors);

        legend.append("text")
            .attr("x", self.options.width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .attr("id", function(d, i) { return "q" + i; })
            .style("text-anchor", "end")
            .text(function(d, i) { return "Q" + i; });

        self.options.onLoad.call();
    };

    d3choropleth.addLayer = function(name, topology) {
        self = this;

        var layerOptions = self.options.layers[name];

        layers[name] = {};
        layers[name].topology = topology;
        layers[name].g = self.svg.append("g")
            .attr("transform", "translate(" + self.options.width / 2 + "," + self.options.height / 2 + ")")
            .append("g")
            .attr("id", name);

        layers[name].g.selectAll(layerOptions.geometriesClass)
            .data(topojson.object(self.fullTopology, topology).geometries)
            .enter().append("path")
            .attr("class", layerOptions.geometriesClass)
            .attr("d", path)
            .on("click", function(d) {
                if (layerOptions.onClick) {
                    layerOptions.onClick.call(d);
                }
            })
            .popover(function(d, i) {
                var id, container, g;
                id = d.properties.ID_1;
                container = d3.select(document.createElement("svg")).attr("height", 50);
                g = container.append("g");

                // Province rate
                var rate = app.ratesData[8].values[id-1].values[app.selection.year-2006].values.toFixed(1);
                g.append("rect")
                    .attr("width", rate * 10)
                    .attr("height", 10)
                    .attr("y", "5");
                g.append("text")
                    .attr("y", "15")
                    .attr("x", rate * 10 + 5)
                    .attr("font-size", 13)
                    .text("RMM: " + rate);

                // National rate
                var nationalRate = app.nationalRates.filter(function(rate) { return rate.year == app.selection.year})[0].rate.toFixed(1);
                g.append("rect")
                    .attr("width", nationalRate * 10)
                    .attr("y", "30")
                    .attr("fill", "steelblue")
                    .attr("height", 10);
                g.append("text")
                    .text("RMM Nación: " + nationalRate)
                    .attr("y", "40")
                    .attr("x", nationalRate * 10 + 5)
                    .attr("font-size", 13);

                var bbox = d3.select(this)[0][0].getBBox();
                return {
                    title : d.properties.NAME_1,
                    content: container,
                    detection: "shape",
                    placement: "fixed",
                    position : [bbox.x+160,bbox.y+270],
                    gravity: "right",
                    displacement: [bbox.width, -25],
                    mousemove: false
                };
            })

        layers[name].g.selectAll(".circle")
            .data(app.medicalCenters)
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", function(d) { return d.x })
            .attr("cy", function(d) { return d.y });
    };

    d3choropleth.colorize = function(layerName, color, calculateQuartile) {
        var self = this;

        var layerOptions = self.options.layers[layerName];
        d3choropleth.currentColorGorup = color;
        var legendColors = colorbrewer[color][4];

        layers[layerName].g.selectAll('.' + layerOptions.geometriesClass)
            .transition()
            .style("fill", function(d) {
                return legendColors[calculateQuartile.call(d)];
            })

        legend.selectAll('rect')
            .transition()
            .style('fill', d3.scale.ordinal().range(legendColors));
    };



    d3choropleth.zoomOut = function(e) {
        var self = this;

        if (e) e.preventDefault();
        var layerID = $(this).attr("id");

        self.doZoom(0, 0, 1, function() {
            var layerID = $(this).attr("id");
            if (self.options.layers[layerID].onZoomOut){
                self.options.layers[layerID].onZoomOut.call(self.svg.selectAll("#"+layerID));
            }
        });
    };

    d3choropleth.doZoom = function(x, y, k, callback) {
        var layersSelector = "#" + Object.keys(layers).join(", #");

        self.svg.selectAll(layersSelector).selectAll("path")
            .classed("active", centered && function(d) { return d === centered; });

        self.svg.selectAll(layersSelector)
            .transition()
            .duration(1000)
            .attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")")
            .style("stroke-width", 1.5 / k + "px")
            .each("end", callback);
    }

    d3choropleth.zoomIn = function(x,y,k){
        var self = this;

        self.doZoom(x, y, k, function() {
            var layerID = $(this).attr("id");
            if (self.options.layers[layerID].onZoomIn) {
                self.options.layers[layerID].onZoomIn.call(self.svg.selectAll("#"+layerID));
            }
        });
    }

    d3choropleth.update = function() {
        self.options.update.call(this);
    }

})()