(function() {
    var svg, directLegend, indirectLegend,referenceLegend;
    var xAxis, yAxis, deathByProvinces,containerDiv;

    var defaultProvinceId = 25;

    var referenceData = [{values:[
        {key: 2006,  y: 0.05, y0: 4.781384478},
        {key: 2007,  y: 0.05, y0: 4.352218632},
        {key: 2008,  y: 0.05, y0: 3.9385},
        {key: 2009,  y: 0.05, y0: 5.4740},
        {key: 2010,  y: 0.05, y0: 4.3375}]
    }];

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

        var index=-1;
        var realValues=deathByProvinces[choosenArea-1].values;


        var layers = stack(realValues);


        // Build the chart
        buildLegends(self);

        var margin = self.options.margin,
            width = self.options.width - margin.left - margin.right,
            height = self.options.height - margin.top - margin.bottom;

        var x = d3.scale.linear().range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var z = function (i) {
            if(app.causesArray[i]!=null) {
                return app.causesArray[i].color;
            }
        }

        xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(5)
            .tickFormat(d3.format("0f"));

        yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        //line used for plotting reference data
        var line = d3.svg.line()
            .x(function (d) {
                return x(d.key);
            })
            .y(function (d) {
                return y(d.y0);
            });

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
                if(app.selection.cause){
                    return d.key == app.selection.cause.key ? app.selection.cause.color : "#aaa";
                }else
                    return z(i);
            })
            .on("click", causeOfDeathAreaChart.setCause);

        paths.transition()
            .duration(1000)
            .attr("d",function (d) {
            return area(d.values);
        }).style("fill", function (d, i) {
                if(app.selection.cause){
                    return d.key == app.selection.cause.key ? app.selection.cause.color : "#aaa";
                }else
                    return z(i);
            });


        paths.exit().selectAll(".cause").transition().duration(2000).remove();

        //reference line
        var references = svg.selectAll(".reference").data(referenceData);

        references.enter().append("path").attr("class", "reference").attr("d", function (d) {
            return line(d.values);
        }).style("fill","none").style("stroke", app.causesReferenceLine.color).style("z-index",1000);

        references.transition().duration(1000).attr("d",function(d){
            return line(d.values);
        }).style("fill","none");

        references.exit().selectAll(".reference").transition().duration(2000).remove();


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
            causeOfDeathAreaChart.filter(choosenArea.value,self);
        }


    }

    causeOfDeathAreaChart.reset = function(e) {
        e.preventDefault();


        // Cause area
        svg.selectAll(".cause")
            .transition().duration(200)
            .style("fill", function(d, i) {
                var cause = app.causesArray.filter(function(elem) { return elem.key == d.key})[0];
                return cause==null?app.causesArray[0].color:cause.color;
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

        app.setCause(null);
    }

    causeOfDeathAreaChart.setCause = function(d) {
        var cause = app.causesArray.filter(function(elem) { return elem.key == d.key})[0];
        app.setCause(cause);
    }

    causeOfDeathAreaChart.paintCauses= function(){

        var cause = app.selection.cause;
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

    }

    causeOfDeathAreaChart.causesArray = function() {
        return causesArray;
    }

    function buildLegends(self) {

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
            .on("click", causeOfDeathAreaChart.setCause)
            .append("title")
            .text(function(d) { return d.text; });


        return legend;
    }


    function drawReferenceLegend(divId, type) {
        var position=app.causesArray.filter(function (cause) {
            return cause.type == type
        }).length;

        var legend = d3.select('#' + divId).select(".legend-box")
            ;
        legend.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d) {
                return app.causesReferenceLine.color })
            .attr("transform", function(d, i) { return "translate(0," + position * 20 + ")"; });
        ;

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .attr("transform", function(d, i) { return "translate(0," + position * 20 + ")"; })
            .text(function(d) { return "RMM Argentina"; });

        return legend;
    }


    function getMax(layers) {
        if (!layers || layers.length == 0) {
            return 0.0;
        }

        var max = 0;

        layers[layers.length - 1].values.map(function (year) {
            if ((year.y0 + year.y) > max) {
                max = year.y0 + year.y;
            }
        });

        referenceData[0].values.map(function (year) {
            if ((year.y0) > max) {
                max = year.y0;
            }
        });

        return max * 1.1;
    }
})()
