(function () {

    var pieChartMap = {},revisedData=[], selectedData=[];

    d3.csv("/assets/data/muertes.csv",function(data){
        data.forEach(function(d){
            //choose cause

            var code = d['codmuer'].replace('O','');
//            var cause = app.causesArray[0];
            var cause=app.causesArray.filter(function(cause){
                for(var i=0;i<cause.codmuer.length;i++){
                    var range = cause.codmuer[i];
                    if(code>=range.from && code<=range.to){
                       return true;
                    }
                }
                return false;
            })[0];
            revisedData.push({
                'anio': d['anio'],
                'cod_prov': d['provre'],
                'cause': cause?cause.key:'unk',
                'atenmed':d['atenmed']
            });
        });

        var deathByProvincesByYearByCause = d3.nest()
            .key(function (d) {
                return d.cause
            })
            .key(function (d) {
                return d.cod_prov;
            })
            .key(function (d) {
                return d.anio
            })
            .key(function(d){
                return d.atenmed;
            })
            .rollup(function (d) {
                return d.length;
            })
            .entries(revisedData);



        var chart=filterPieCharts.charts.filter(function(c){
            if(c.id=="cobertura"){
                return true;
            }
        })[0];


        if(app.selection.cause) {
            for(var i=0;i<deathByProvincesByYearByCause.length;i++) {
                if(deathByProvincesByYearByCause[i].key==app.selection.cause.key) {
                   data=deathByProvincesByYearByCause[i];
                }
            }
        }
        chart.data = deathByProvincesByYearByCause;
    });


    filterPieCharts = {
        charts: [
            {id: 'cobertura', divId: "pieChart1", data: null},
            {id: 'escuela', divId: "pieChart2", data: null},
            {id: 'edad', divId: "pieChart3", data: null},
            {id: 'atencion', divId: "pieChart4", data: null},
            {id: 'atencion', divId: "pieChart5", data: null}
        ]
    };

    var w = 150,                        //width
        h = 150,                            //height
        r = 70,                            //radius
        color = d3.scale.category20c();     //builtin range of colors


    filterPieCharts.createPieChart = function (divId) {
        var chart = filterPieCharts.charts.filter(function(c){
            return c.divId == divId;
        })[0];

        pieChartMap[divId] = {};
        pieChartMap[divId].arc = d3.svg.arc()
            .outerRadius(r);

        pieChartMap[divId].vis = d3.select("#" + divId).append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

        pieChartMap[divId].pie = d3.layout.pie()
            .sort(null);

        var data = chart.data?chart.data:this.dataset.apples;
        pieChartMap[divId].path = pieChartMap[divId].vis.selectAll("path")
            .data(pieChartMap[divId].pie(data))
            .enter().append("path")
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr("d", pieChartMap[divId].arc)
            .each(function (d) {
                this._current = d;
            }); // store the initial values
    }

    filterPieCharts.updatePieChart = function (divId) {
        //update
        var chart = filterPieCharts.charts.filter(function(c){
            return c.divId == divId;
        })[0];
        var data = this.dataset.oranges;
        if(chart.data){
//            console.log(chart.data);

        }

        pieChartMap[divId].path = pieChartMap[divId].path.data(pieChartMap[divId].pie(data)); // update the data

        var self = this;

        pieChartMap[divId].path.enter().append("path")
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr("d", this.arc)
            .each(function (d) {
                this._current = d;
            }); // store the initial values


        pieChartMap[divId].path.transition().duration(750).attrTween("d", function (a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function (t) {
                return pieChartMap[divId].arc(i(t));
            };
        });


        pieChartMap[divId].path.exit().transition().duration(750).attrTween("d",function (a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function (t) {
                return self.arc(i(t));
            };
        }).remove();

    }

    filterPieCharts.drawPieCharts = function () {

        var random = 10 + Math.random() * 30;

        this.dataset = {
            apples: [random, 50 - random, 50],
            oranges: [200, 200, 0]
        };

//        pieChart.createPieChart({divId:'pieChart1'},this.dataset.apples);

        this.updateDataWithSelection();

        filterPieCharts.charts.map(function(c){return c.divId}).forEach(function (div) {
            if (pieChartMap[div]) {
                console.log(pieChartMap[div]);
                pieChartMap[div].update(filterPieCharts.dataset.oranges);
            } else {
                pieChartMap[div]=pieChart.createPieChart({divId:div},filterPieCharts.dataset.apples);
            }
        });

    }


    filterPieCharts.updateDataWithSelection= function(){

        var keySelectors = [];

        //filter revisedData
        var data = d3.nest();
        if(app.selection.cause){
            console.log('key cause ' + app.selection.cause.key);
            data = data.key(function(d){
                return d.cause;
            })
            keySelectors.push(app.selection.cause.key);
        }
        if(app.selection.province) {
            console.log('key province');

            data = data.key(function(d){
                return d.cod_prov;
            })
            keySelectors.push(app.selection.province);
        }
        if(app.selection.year) {
            console.log('key year ' + app.selection.year);

            data = data.key(function(d){
                return d.anio;
            })
            keySelectors.push(app.selection.year);
        }

        data=data.key(function(d){
            return d.atenmed;
        }).entries(revisedData);

        console.log(data)


        console.log("selectors: " + keySelectors);
        for(var i=0;i<keySelectors.length;i++) {
            data = data.filter(function(element){
                if(element.key==keySelectors[i]) {
                    console.log("filtering " + keySelectors[i]);
                    return true;
                }
                return false;
            })[0];
            if(data!=null){
                data=data.values;
            }else{
                break;
            }

        }

        if(data!=null){
            console.log(data);
        }else{

        }
//        var deathByProvincesByYearByCause = d3.nest()

//                return d.cause
//            })
//            .key(function (d) {
//                return d.cod_prov;
//            })
//            .key(function (d) {
//                return d.anio
//            })
//            .key(function(d){
//                return d.atenmed;
//            })
//            .rollup(function (d) {
//                return d.length;
//            })
//            .entries(revisedData);



    }

})();