(function() {
    var svg, directLegend, indirectLegend;
    var xAxis, yAxis;

    var causesArray = [
        { key:'Otras_ind_P', color:'#bf66b1', colorGroup:'PuRd', type:'indirect', text:'Otras causas indirectas' },
        { key:'Enf_por_VIH_P', color:'#ad5000', colorGroup:'YlOrBr', type:'indirect', text:'Enfermedad por VIH' },
        { key:'Otras_directas_P', color:'#789b41', colorGroup:'Greens', type:'direct', text:'Otras causas directas' },
        { key:'Sepsis_y_O_P', color:'#e6a827', colorGroup:'YlOrRd', type:'direct', text:'Sepsis' },
        { key:'Hemorragia_post_P', color:'#b74c00', colorGroup:'Oranges', type:'direct', text:'Hemorragia postparto' },
        { key:'T_Placenta_P', color:'#6151a5', colorGroup:'Purples', type:'direct', text:'Trastornos de placenta y hemorragias' },
        { key:'T_Hipert_P', color:'#486fb7', colorGroup:'Blues', type:'direct', text:'Trastornos hipertensivos' },
        { key:'Aborto_P', color:'#a8251d', colorGroup:'Reds', type:'direct', text:'Embarazo terminado en aborto' }
    ];

    causeOfDeathAreaChart = {
        options : {
            width : 500,
            height : 300,
            margin : {top: 20, right: 30, bottom: 30, left: 40}
        }
    };


    causeOfDeathAreaChart.filter= function(provinceId){
        svg.selectAll('.cause')
            .style('fill','black')

    }

    causeOfDeathAreaChart.draw = function(areaId, containerDivId, customOptions) {
        var self = this;

        $.extend(true, self.options, customOptions);

        var choosenArea = null;

        if(areaId == 'total'){
               choosenArea = 27;
        }else{
            choosenArea = areaId;
        }

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


            var layers = stack(deathByProvince[choosenArea].values);


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

            xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(5)
                .tickFormat(d3.format("0f"));

            yAxis = d3.svg.axis()
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

            if (!svg) {
                svg = d3.select("#" + containerDivId).append("svg")
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

            y.domain([0,getMax(layers)]);

            var paths = svg.selectAll(".cause")
                .data(layers);
                paths
                .enter().append("path")
                .attr("class", "cause")
                .attr("d", function(d) {
                    return area(d.values);
                })
                .style("fill", function(d, i) { return z(i); })
                .on("click", causeOfDeathAreaChart.setCause);

            paths.transition().attr("d",function(d) {
                return area(d.values);
            }).style("fill", function(d, i) { return z(i); })


            paths.exit().selectAll(".cause").transition().duration(2000).remove();


            svg.select('.x.axis').call(xAxis);
            svg.select('.y.axis').call(yAxis);
           /* svg.append("g")
                .attr("class","x axis")
                .call(xAxis);
*//*
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);*/

        })
    }

    causeOfDeathAreaChart.reset = function(e) {
        e.preventDefault();

        // Cause area
        svg.selectAll(".cause")
            .transition().duration(200)
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

    function getMax(layers){
        if(!layers ||layers.length==0 ){
            return 0.0;
        }

        var max = 0.0;

        for(var i=0;i<layers.length;i++){
            var lastElements = layers[layers.length-1];
            var lastPoint = lastElements.values[lastElements.values.length-1];
            if (lastPoint.y0 + lastPoint.y > max) {
                max = lastPoint.y0 + lastPoint.y;
            };

        }

        return max*1.5;
    }
})()