(function() {
    var svg, directLegend, indirectLegend;
    var xAxis, yAxis, deathByProvinces,containerDiv;

    var defaultProvinceId = 25;

    causeOfDeathAreaChart = {
        options : {
            width : 500,
            height : 300,
            margin : {top: 20, right: 30, bottom: 30, left: 40}
        }
    };

    causeOfDeathAreaChart.filter= function(choosenArea,self){

        if(!choosenArea){
            choosenArea =  defaultProvinceId;
        }

        var stack = d3.layout.stack()
            .offset("zero")
            .values(function(d) {
                return d.values;
            })
            .x(function(d) {
                return d.key;
            })
            .y(function(d) {
                return d.values;
            });

        var layers = stack(deathByProvinces[choosenArea-1].values);

        // Build the chart
        buildLegends(self);

        var margin = self.options.margin,
            width = self.options.width - margin.left - margin.right,
            height = self.options.height - margin.top - margin.bottom;

        var x = d3.scale.linear().range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var z = function (i) {
            return app.causesArray[i].color;
        }

        xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(5)
            .tickFormat(d3.format("0f"));

        yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");


        var area = d3.svg.area()
            .x(function (d) {
                return x(d.key);
            })
            .y0(function (d) {
                return y(d.y0);
            })
            .y1(function (d) {
                return y(d.y0 + d.y);
            });

        if (!svg) {

            svg = d3.select("#" + containerDiv).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")");

            svg.append("g")
                .attr("class", "y axis");
        }

        x.domain([2006, 2010]);

        y.domain([0, getMax(layers)]);

        var paths = svg.selectAll(".cause")
            .data(layers);
        paths
            .enter().append("path")
            .attr("class", "cause")
            .attr("d", function (d) {
                return area(d.values);
            })
            .style("fill", function (d, i) {
                return z(i);
            })
            .on("click", causeOfDeathAreaChart.setCause);

        paths.transition()
            .duration(1000)
            .attr("d",function (d) {
            return area(d.values);
        }).style("fill", function (d, i) {
                return z(i);
            })


        paths.exit().selectAll(".cause").transition().duration(2000).remove();


        svg.select('.x.axis').transition().duration(1000).call(xAxis);
        svg.select('.y.axis').transition().duration(1000).call(yAxis);

    }

    causeOfDeathAreaChart.loadData = function (callback) {
        var self = this;
        d3.csv("/assets/data/razon_muertes.csv", function (data) {
            var revisedData = [];
            // Process data
            data.forEach(function (d) {
                /*keys [anio, cod_prov ,provincia ,Aborto_P ,T_Hipert_P ,T_Placenta_P ,Otras_directas_P ,Hemorragia_post_P ,Sepsis_y_O_P ,Enf_por_VIH_P ,Otras_ind_P];
                 */
                var i = 0;
                for (i = 0; i < app.causesArray.length; i++) {
                    var cause = app.causesArray[i].key;
                    revisedData.push({
                        'anio': d['anio'],
                        'cod_prov': d['cod_prov'],
                        'provincia': d['provincia'],
                        'cause': cause,
                        'value': d[cause]
                    });
                }
            });

            deathByProvinces = d3.nest()
                .key(function (d) {
                    return d.provincia
                })
                .key(function (d) {
                    return d.cause
                })
                .key(function (d) {
                    return d.anio
                })
                .rollup(function (d) {
                    var val = parseFloat(d[0].value);
                    return val ? val : 0.0;
                })
                .entries(revisedData);

            callback.call(self,null,self);
        });


    }

    causeOfDeathAreaChart.draw = function(containerDivId, customOptions) {
        var self = this;
        $.extend(true, self.options, customOptions);

        if (!containerDiv) { containerDiv = containerDivId; }

        var choosenArea = app.selection.province ? app.selection.province : defaultProvinceId;

        if(!deathByProvinces){
            causeOfDeathAreaChart.loadData(causeOfDeathAreaChart.filter);
        }else{
            causeOfDeathAreaChart.filter(choosenArea,self);
        }

    }

    causeOfDeathAreaChart.reset = function(e) {
        e.preventDefault();

        // Cause area
        svg.selectAll(".cause")
            .transition().duration(200)
            .style("fill", function(d, i) {
                var cause = app.causesArray.filter(function(elem) { return elem.key == d.key})[0];
                return cause.color;
            });

        // Direct legend
        directLegend.selectAll('.legend-box rect')
            .transition()
            .style('fill', function(d) {
                return d.color;
            });
        directLegend.selectAll('.legend-box text')
            .transition()
            .style('fill', '#333');

        // Indirect legend
        indirectLegend.selectAll('.legend-box rect')
            .transition()
            .style('fill', function(d) {
                return d.color;
            });
        indirectLegend.selectAll('.legend-box text')
            .transition()
            .style('fill', '#333');

        d3choropleth.currentColorGorup = d3choropleth.defaultColorGorup;

        app.selection.cause = null;
        app.calculateQuartiles(app.ratesData[app.getRatesIndex()]);
        d3choropleth.colorize("provinces", d3choropleth.currentColorGorup, function() {
            return app.quartile(this.properties.ID_1);
        });
    }

    causeOfDeathAreaChart.setCause = function(d) {
        var cause = app.causesArray.filter(function(elem) { return elem.key == d.key})[0];

        app.selection.cause = cause;

        // Cause area
        svg.selectAll(".cause")
            .transition()
            .style("fill", function(d) {
                return d.key == cause.key ? cause.color : "#aaa";
            });

        // Direct cause legend
        directLegend.selectAll('.legend-box rect')
            .transition()
            .style('fill', function(d) {
                return d.key == cause.key ? cause.color : "#aaa";
            });
        directLegend.selectAll('.legend-box text')
            .transition()
            .style('fill', function(d) {
                return d.key == cause.key ? '#333' : "#aaa";
            });

        // Indirect cause legend
        indirectLegend.selectAll('.legend-box rect')
            .transition()
            .style('fill', function(d) {
                return d.key == cause.key ? cause.color : "#aaa";
            });
        indirectLegend.selectAll('.legend-box text')
            .transition()
            .style('fill', function(d) {
                return d.key == cause.key ? '#333' : "#aaa";
            });

        app.selection.cause = cause;
        app.calculateQuartiles(app.ratesData[app.getRatesIndex()]);
        d3choropleth.colorize("provinces", cause.colorGroup, function() {
            return app.quartile(this.properties.ID_1);
        })
    }

    causeOfDeathAreaChart.causesArray = function() {
        return causesArray;
    }

    function buildLegends(self) {
        //FIX legends
        if(!directLegend){
            directLegend = drawLegend(self.options.directCausesLegendDivId, 'direct');
        }
        if(!indirectLegend){
            indirectLegend = drawLegend(self.options.indirectCausesLegendDivId, 'indirect');
        }
    }

    function drawLegend(divId, type) {
        var legend = d3.select('#' + divId).append('svg')
            .attr('width', 140)
            .attr('height', 120)
            .append('g')
            .selectAll('.legend-box')
            .data(app.causesArray.filter(function(cause) { return cause.type == type }))
            .enter()
            .append('g')
            .attr("class", "legend-box")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d) { return d.color })
            .on("click", causeOfDeathAreaChart.setCause);

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(function(d) { return d.text; })
            .on("click", causeOfDeathAreaChart.setCause);

        return legend;
    }

    function getMax(layers){
        if(!layers ||layers.length==0 ){
            return 0.0;
        }

        var max = 0;
        layers[layers.length-1].values.map(function(year) {
            if ((year.y0 + year.y) > max) {
                max = year.y0 + year.y;
            }
        });

        return max * 1.1;
    }
})()
