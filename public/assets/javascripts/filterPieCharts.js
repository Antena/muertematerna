(function () {

    var pieChartMap = {}, revisedData = [], selectedData = [];
    loaded = false;


    var w = 150,                        //width
        h = 150,                            //height
        r = 70,                            //radius
        color = d3.scale.category20c();     //builtin range of colors

    d3.csv("/assets/data/muertes-refined-causas.csv", function (data) {
        data.forEach(function (d) {
            revisedData.push({
                'anio': d['anio'],
                'cod_prov': d['codprov'],
                'cause': d['id_muerte'],
                'atenmed': d['atenmed'],
                'grupedad': d['grupedad'],
                'finstruc': d['finstruc'],
                'asociad': d['asociad'],
                'ocloc': d['ocloc']
            });
        });
        loaded = true;
        filterPieCharts.drawPieCharts();
    });


    filterPieCharts = {
        chartsDefinitions: [
            {id: 'cobertura', divId: "pieChart1", data: null, pieKeys: ["0", "1", "2", "3", "4", "9"]},
            {id: 'dondemuerte', divId: "pieChart2", data: null, pieKeys: ["1", "2", "3", "4", "9"]},
            {id: 'atenMed', divId: "pieChart3", data: null, pieKeys: ["1", "2", "9"]},
            {id: 'escuela', divId: "pieChart4", data: null, pieKeys: ["1", "3", "4", "5", "99"]},
            {id: 'grupedad', divId: "pieChart5", data: null, pieKeys: ["0", "10", "15", "20", "25", "30", "35", "40", "45"]}
        ]
    };


    filterPieCharts.drawPieCharts = function () {
        if (!loaded)
            return;

        this.updateDataWithSelection();

        filterPieCharts.chartsDefinitions.forEach(function (chartDef) {
            var newData = chartDef.data;

            if (pieChartMap[chartDef.id]) {
                    pieChartMap[chartDef.id].update(newData);
            } else {
                pieChartMap[chartDef.id] = pieChart.createPieChart({divId: chartDef.divId}, newData);
            }
        });

    }

    filterPieCharts.getChart = function (id) {
        return filterPieCharts.chartsDefinitions.filter(function (chart) {
            if (chart.id == id) {
                return true;
            }
            return false;
        })[0];
    }

    filterPieCharts.updateDataWithSelection = function () {


        filterPieCharts.doAggregation(function(d){return d.grupedad},"grupedad");
        filterPieCharts.doAggregation(function(d){return d.atenmed},"atenMed");
        filterPieCharts.doAggregation(function(d){return d.finstruc},"escuela");
        filterPieCharts.doAggregation(function(d){return d.asociad},"cobertura");
        filterPieCharts.doAggregation(function(d){return d.ocloc},"dondemuerte");

    }

    filterPieCharts.filterSelection = function (keySelectors, aggregateData) {
        for (var i = 0; i < keySelectors.length; i++) {
            aggregateData = aggregateData.filter(function (element) {
                if (element.key == keySelectors[i]) {
                    //console.log("filtering " + keySelectors[i]);
                    return true;
                }
                return false;
            })[0];
            if (aggregateData != null) {
                aggregateData = aggregateData.values;
            } else {
                //console.log("no data for selection");
                break;
            }
        }
        return aggregateData;
    }

    filterPieCharts.buildNest = function () {
        var keySelectors = [];
        //filter data using selection
        var data = d3.nest();
        if (app.selection.cause) {
            data = data.key(function (d) {
                return d.cause;
            })
            keySelectors.push(app.selection.cause.key);
        }
        if (app.selection.province) {

            data = data.key(function (d) {
                return d.cod_prov;
            })
            keySelectors.push(app.selection.province.value);
        }
        if (app.selection.year) {

            data = data.key(function (d) {
                return d.anio;
            })
            keySelectors.push(app.selection.year);
        }

        return {data: data, selectors: keySelectors};
    }

    filterPieCharts.doAggregation = function (groupFunction, chartDefId) {

        var nestedData = filterPieCharts.buildNest();
        var copyData = nestedData.data;
        var keySelectors = nestedData.selectors;


        //at this point data is grouped according to selection
        //but has no aggregate data, we build aggregations using groupFunction


        var aggregateData = copyData.key(groupFunction).entries(revisedData);
        aggregateData = this.filterSelection(keySelectors, aggregateData);

        if (aggregateData) {

            var total = 0;
            aggregateData.forEach(function (v) {
                total += v.values.length;
            });

            //console.log("total " + total);

            if (total > 0) {
                //build pie chart data
                var chartdef = filterPieCharts.getChart(chartDefId);
                if (chartdef) {
                    var atenMedPieData = [];
                    chartdef.pieKeys.forEach(function (key) {
                        var percent = 0.0;
                        aggregateData.forEach(function (e) {
                            if (e.key == key) {
                                percent = e.values ? e.values.length / total : 0;
                            }
                        });
                        atenMedPieData.push(percent);
                    });
                    chartdef.data = atenMedPieData;
                    app.selection.selectionSize = total;
                }
            }

        }else{
            //no matching rows for selection
            app.selection.selectionSize = 0;
        }
    }

})();