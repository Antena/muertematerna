(function() {

    var layers = {};
    var g, path;
    var background;
    var legend;
    var zoomedIn = false;

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
            .attr("transform", "translate(0," + (self.options.height - 5 * 20) + ")");

        legend.append("text")
            .attr("x", self.options.width)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .style("font-weight", "bold")
            .text("Cuartiles RMM");

        var legendBox = legend.selectAll(".legend-box")
            .data(colorbrewer.Blues[4])
            .enter().append("g")
            .attr("class", "legend-box")
            .attr("id", function(d,i) { return "q" + i })
            .attr("transform", function(d, i) { return "translate(0," + (i+1) * 20 + ")"; });

        legendBox.append("rect")
            .attr("x", self.options.width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", legendColors);

        legendBox.append("text")
            .attr("x", self.options.width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .attr("class", "box-label")
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

        layers[name].path = layers[name].g.selectAll(layerOptions.geometriesClass)
            .data(topojson.object(self.fullTopology, topology).geometries)
            .enter().append("path");

        layers[name].path
            .attr("class", layerOptions.geometriesClass)
            .attr("id", function(d) { return name + d.properties[layerOptions.id]; })
            .attr("d", path)
            .on("click", function(d) {
                if (layerOptions.onClick) {
                    layerOptions.onClick.call(d);
                }
            })
            .attr("transform", function(d) {
                if (d.properties.ID_1 == 5) {
                    return "translate(-237, 592)scale(8, 8)";
                } else {
                    return null;
                }
            })
            .style("stroke-width", function(d) {
                if (d.properties.ID_1 == 5) {
                    return 0.1;
                } else {
                    return 1;
                }
            })

        if (layerOptions.tooltip)
            layers[name].path.tooltip(layerOptions.tooltip);

        layers[name].g.selectAll(".circle")
            .data(app.medicalCenters)
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", function(d) { return d.x })
            .attr("cy", function(d) { return d.y });
    };

    d3choropleth.colorize = function(layerName, color, calculateQuartile, onlyWithId) {
        var self = this;

        var layerOptions = self.options.layers[layerName];
        d3choropleth.currentColorGorup = color;
        var legendColors = colorbrewer[color][4];

        var selector = onlyWithId ?
            "#" + onlyWithId :
            "." + layerOptions.geometriesClass;
        layers[layerName].g.selectAll(selector)
            .transition()
            .style("fill", function(d) {
                return legendColors[calculateQuartile.call(d)];
            })

        legend.selectAll('rect')
            .transition()
            .style('fill', d3.scale.ordinal().range(legendColors));
    };

    d3choropleth.mute = function(layerName, exceptWithId) {
        var self = this;

        var layerOptions = self.options.layers[layerName];

        layers[layerName].g
            .selectAll("." + layerOptions.geometriesClass + ":not(#" + exceptWithId + ")")
            .transition()
            .style("fill", function(d) {
                return "#aaaaaa"
            });
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
        zoomedIn = false;
    };

    d3choropleth.doZoom = function(x, y, k, callback) {
        var layersSelector = "#" + Object.keys(layers).join(", #");

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

        zoomedIn = true;
    }

    d3choropleth.isZoomedIn = function() {
        return zoomedIn;
    }

    d3choropleth.update = function() {
        self.options.update.call(this);
    }

})()