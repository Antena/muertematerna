(function() {
    var fillContent = function(options, create) {
        var element = d3.select(this);

        var calculateCoordinates = function(selection) {
            var center, offsets;
            var width = selection[0][0].clientWidth, height = selection[0][0].clientHeight;
            center = [0, 0];
            if (options.type === "mouse") {
                center = [d3.event.pageX, d3.event.pageY]
                center[0] -= width/2;
            } else {
                offsets = element[0][0].getBoundingClientRect();
                center[0] = offsets.left;
                center[0] += window.scrollX;
                center[0] += offsets.width;

                center[1] = offsets.top;
                center[1] += window.scrollY;
                center[1] += offsets.height/2;
                center[1] -= height/2;
            }

            center[0] += options.displacement[0];
            center[1] += options.displacement[1];

            return center;
        };

        element.on("mouseover", function() {
            var tip = create();
            var coordinates = calculateCoordinates(tip);
            tip.classed("in", true)
                .style("left", coordinates[0] + "px")
                .style("top", coordinates[1] + "px");
        });

        if (options.type == "mouse") {
            element.on("mousemove", function() {
                var tip = d3.selectAll(".tooltip");
                var coordinates = calculateCoordinates(tip);
                tip
                    .style("left", coordinates[0] + "px")
                    .style("top", coordinates[1] + "px");
            });
        }

        element.on("mouseout", function() {
            var tip = d3.selectAll(".tooltip").classed("in", false);
            tip.remove();
        });
    };

    d3.selection.prototype.tooltip = function(f) {
        var body = d3.select('body');

        return this.each(function(d, i) {
            var create_tooltip, options;

            options = f.apply(this, arguments);
            create_tooltip = function() {
                var tip = body.append("div")
                    .classed("tooltip", true)
                    .style("position", "absolute")
                    .style("pointer-events", "none")
                    .html(options.content)
                return tip;
            }

            return fillContent.call(this, options, create_tooltip);
        });

    }

})();