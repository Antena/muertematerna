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


d3.csv("/assets/data/tasas_por_causa.csv", function(data) {
    var revisedData = [];
    // Process data
    var causesArray = ['Aborto_P' ,'T_Hipert_P','T_Placenta_P','Otras_directas_P','Hemorragia_post_P','Sepsis_y_O_P' ,'Enf_por_VIH_P','Otras_ind_P'].reverse();
    data.forEach(function (d) {
        /*keys [anio, cod_prov ,provincia ,Aborto_P ,T_Hipert_P ,T_Placenta_P ,Otras_directas_P ,Hemorragia_post_P ,Sepsis_y_O_P ,Enf_por_VIH_P ,Otras_ind_P];
         */
        var i = 0;
        for (i = 0; i < causesArray.length; i++) {
            var cause = causesArray[i];
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

    console.log(deathByProvince[27].values);

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


    console.log(layers);




    // Build the chart
    var margin = {top: 20, right: 30, bottom: 30, left: 40},
        width = 500 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var x =  d3.scale.linear().range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var z = d3.scale.category10();

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
            console.log(d.y0);
            return y(d.y0);
        })
        .y1(function(d) {
            console.log(d.y0 + d.y);
            return y(d.y0 + d.y);
        });

    var svg = d3.select("#causesByYear").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain([2006, 2010]);
    y.domain([0,6]);

    svg.selectAll(".layer")
        .data(layers)
        .enter().append("path")
        .attr("class", "layer")
        .attr("d", function(d) {
            return area(d.values);
        })
        .style("fill", function(d, i) { return z(i); })
        .on("click", function(d) {
            var cause = deathsByProvinceByCause.filter(function(cause) { return cause.key == d.key})[0];
            $(".province").each(function(index, path) {
                var provre = $(path).attr("data-id");
                var value = cause.values[provre] ? cause.values[provre].values : 0;
                var quartile = Math.floor((Math.random()*4));
                $(path).attr("class", "province " + "q" + quartile + "-4")
            });
        })

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

})