(function() {

    var causes = [
        "Embarazo terminado en aborto",
        "Causas obstétricas directas|Trastornos hipertensivos",
        "Causas obstétricas directas|Trastornos de placenta y hemorragias preparto",
        "Causas obstétricas directas|Hemorragia postparto",
        "Causas obstétricas directas|Sepsis",
        "Causas obstétricas directas|Otras causas directas",
        "Causas obstétricas indirectas|Enfermedad por virus de la inmunodeficiencia humana",
        "Causas obstétricas indirectas|Otras causas indirectas"
    ];

    var causesArray = [
        { key : 'Aborto_P', color:'#9467bd', colorGroup:'Purples' },
        { key : 'T_Hipert_P', color:'#1f77b4', colorGroup:'Blues' },
        { key : 'T_Placenta_P', color:'#2ca02c', colorGroup:'Greens' },
        { key : 'Otras_directas_P', color:'#ff7f0e', colorGroup:'Oranges'},
        { key : 'Hemorragia_post_P', color:'#d62728', colorGroup:'Reds'},
        { key : 'Sepsis_y_O_P', color:'#CE1256', colorGroup:'PuRd'},
        { key : 'Enf_por_VIH_P', color:'#d62728', colorGroup:'YlOrBr'},
        { key : 'Otras_ind_P', color:'#7f7f7f', colorGroup:'Greys'}
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

            var svg = d3.select("#" + containerDivId).append("svg")
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
                .on("click", function(d, i) {
                    var cause = causesArray.filter(function(elem) { return elem.key == d.key})[0];
                    d3choropleth.colorize("provinces", cause.colorGroup, function() {
                        return Math.floor(Math.random() * 4);
                    })
                })

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

        })
    }
})()
