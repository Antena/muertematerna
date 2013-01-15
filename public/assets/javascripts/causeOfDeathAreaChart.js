(function() {
    var svg, directLegend, indirectLegend;

    var causesArray = [
        { key:'Aborto_P', color:'#9467bd', colorGroup:'Purples', type:'direct', text:'Embarazo terminado en aborto' },
        { key:'T_Hipert_P', color:'#1f77b4', colorGroup:'Blues', type:'direct', text:'Trastornos hipertensivos' },
        { key:'T_Placenta_P', color:'#2ca02c', colorGroup:'Greens', type:'direct', text:'Trastornos de placenta y hemorragias' },
        { key:'Otras_directas_P', color:'#ff7f0e', colorGroup:'Oranges', type:'direct', text:'Otras causas directas' },
        { key:'Hemorragia_post_P', color:'#d62728', colorGroup:'Reds', type:'direct', text:'Hemorragia postparto' },
        { key:'Sepsis_y_O_P', color:'#CE1256', colorGroup:'PuRd', type:'direct', text:'Sepsis' },
        { key:'Enf_por_VIH_P', color:'#d62728', colorGroup:'YlOrBr', type:'indirect', text:'Enfermedad por VIH' },
        { key:'Otras_ind_P', color:'#7f7f7f', colorGroup:'Greys', type:'indirect', text:'Otras causas indirectas' }
    ];

    causeOfDeathAreaChart = {
        options : {
            width : 500,
            height : 300,
            margin : {top: 20, right: 30, bottom: 30, left: 40}
        }
    };

    causeOfDeathAreaChart.draw = function(containerDivId, customOptions) {
        var self = this;

        $.extend(true, self.options, customOptions);

        d3.csv("/assets/data/tasas_por_causa.csv", function(data) {
            var revisedData = [];
            // Process data
            causesArray.reverse();
            data.forEach(function (d) {
                /*keys [anio, cod_prov ,provincia ,Aborto_P ,T_Hipert_P ,T_Placenta_P ,Otras_directas_P ,Hemorragia_post_P ,Sepsis_y_O_P ,Enf_por_VIH_P ,Otras_ind_P];
                 */
                var i = 0;
                for (i = 0; i < causesArray.length; i++) {
                    var cause = causesArray[i].key;
                    revisedData.push({
                        'anio': d['anio'],
                        'cod_prov': d['cod_prov'],
                        'provincia': d['provincia'],
                        'cause': cause,
                        'value': d[cause]
                    });
                }
            });

            var deathByProvince = d3.nest()
                .key(function(d){return d.provincia})
                .key(function(d){ return d.cause})
                .key(function(d){return d.anio})
                .rollup(function(d){
                    var val = parseFloat(d[0].value);
                    return val?val:0.0;
                })
                .entries(revisedData);

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


            var layers = stack(deathByProvince[27].values);

            // Build the chart
            buildLegends(self);

            var margin = self.options.margin,
                width = self.options.width - margin.left - margin.right,
                height = self.options.height - margin.top - margin.bottom;

            var x =  d3.scale.linear().range([0, width]);

            var y = d3.scale.linear()
                .range([height, 0]);

            var z = function(i) {
                return causesArray[i].color;
            }

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(5)
                .tickFormat(d3.format("0f"));

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");


            var area = d3.svg.area()
                .x(function(d) {
                    return x(d.key);
                })
                .y0(function(d) {
                    return y(d.y0);
                })
                .y1(function(d) {
                    return y(d.y0 + d.y);
                });

            svg = d3.select("#" + containerDivId).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            x.domain([2006, 2010]);
            y.domain([0,6]);

            svg.selectAll(".layer")
                .data(layers)
                .enter().append("path")
                .attr("class", "cause")
                .attr("d", function(d) {
                    return area(d.values);
                })
                .style("fill", function(d, i) { return z(i); })
                .on("click", causeOfDeathAreaChart.setCause);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

        })
    }

    causeOfDeathAreaChart.reset = function(e) {
        e.preventDefault();

        // Cause area
        svg.selectAll(".cause")
            .transition()
            .style("fill", function(d, i) {
                var cause = causesArray.filter(function(elem) { return elem.key == d.key})[0];
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
    }

    causeOfDeathAreaChart.setCause = function(d) {
        var cause = causesArray.filter(function(elem) { return elem.key == d.key})[0];

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

        d3choropleth.colorize("provinces", cause.colorGroup, function() {
            return Math.floor(Math.random() * 4);
        })
    }

    function buildLegends(self) {
        directLegend = drawLegend(self.options.directCausesLegendDivId, 'direct');
        indirectLegend = drawLegend(self.options.indirectCausesLegendDivId, 'indirect');
    }

    function drawLegend(divId, type) {
        var legend = d3.select('#' + divId).append('svg')
            .attr('width', 140)
            .attr('height', 120)
            .append('g')
            .selectAll('.legend-box')
            .data(causesArray.filter(function(cause) { return cause.type == type }))
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
})()
