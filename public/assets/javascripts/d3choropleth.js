(function() {

    var layers = {};
    var path, centered, zoomedGroup;

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

    d3choropleth.map = function(containerDivId, defaultOptions) {
        var self = this;

        // Gather map options
        self.options.selector = '#' + containerDivId;
        self.container = $(self.options.selector);
        $.extend(self.options, defaultOptions);

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
        self.svg.append("rect")
            .attr("class", "background")
            .attr("width", self.options.width)
            .attr("height", self.options.height)
            .on("click", function(d) {
                zoomToObject(d);
            });

        // Map layers
        for (name in self.options.layers) {
            self.addLayer(name, topology.objects[name]);
        }
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
                if (layerOptions.clickToZoom) {
                    zoomedGroup = layers[name].g;
                    zoomToObject(d);
                }

            });
    }

    function zoomToObject(d) {
        var x = 0,
            y = 0,
            k = 1;

        if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = -centroid[0];
            y = -centroid[1];
            k = 4;
            centered = d;
        } else {
            centered = null;
        }

        zoomedGroup.selectAll("path")
            .classed("active", centered && function(d) { return d === centered; });

        zoomedGroup.transition()
            .duration(1000)
            .attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")")
            .style("stroke-width", 1.5 / k + "px");
    }

})()