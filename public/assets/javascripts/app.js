(function() {

    var currentIndex = 24;

    app = {};

    app.causesArray = [
        { key:'aborto_razon', color:'#a8251d', colorGroup:'Reds', type:'direct', text:'Embarazo terminado en aborto' },
        { key:'hipert_razon', color:'#486fb7', colorGroup:'Blues', type:'direct', text:'Trastornos hipertensivos' },
        { key:'placenta_razon', color:'#6151a5', colorGroup:'Purples', type:'direct', text:'Trastornos de placenta y hemorragias' },
        { key:'hemorragias_razon', color:'#b74c00', colorGroup:'Oranges', type:'direct', text:'Hemorragia postparto' },
        { key:'sepsis_razon', color:'#e6a827', colorGroup:'YlOrRd', type:'direct', text:'Sepsis' },
        { key:'otras_directas_razon', color:'#789b41', colorGroup:'Greens', type:'direct', text:'Otras causas directas' },
        { key:'vih_razon', color:'#ad5000', colorGroup:'YlOrBr', type:'indirect', text:'Enfermedad por VIH' },
        { key:'otras_ind_razon', color:'#bf66b1', colorGroup:'PuRd', type:'indirect', text:'Otras causas indirectas' }
    ];

    app.quartiles = [];

    app.selection = {
        cause : null,
        province : null,
        year : 2010
    };

    app.ratesData = null;

    app.init = function() {
        var self = this;

        d3.csv("/assets/data/razon_muertes.csv", function(data) {

            // Location typeahead
            $('#locationTypeahead').typeahead({
                source : ["Buenos Aires"]
            });

            // Year slider
            $('#slider').slider({
                value : 2010,
                min : 2006,
                max : 2010,
                step : 1,
                slide : function(event, ui) {
                    app.selection.year = ui.value;
                    self.calculateQuartiles(app.ratesData[app.getRatesIndex()]);
                    d3choropleth.colorize("provinces", d3choropleth.currentColorGorup, function() {
                        return self.quartile(this.properties.ID_1);
                    });
                }
            })

            // Zoom out
            $('#zoomout').click(function(e){
                d3choropleth.zoomOut(e);
                self.selection.province = null;
                causeOfDeathAreaChart.draw();
            });

            // Reset area chart
            $('#resetarea').click(causeOfDeathAreaChart.reset);

            // Cause of death area chart
            causeOfDeathAreaChart.draw('causesByYear', {
                width: 380,
                margin : {left: 25, right:15, top:5, bottom:20},
                directCausesLegendDivId : 'direct-causes-legend',
                indirectCausesLegendDivId : 'indirect-causes-legend'
            });

            // Map
            app.ratesData = processRateData(data);
            d3choropleth.map("map", {
                width : 300,
                height: 500,
                scale : 4000,
                center : [-48, -55.5],
                dataUrl : '/assets/data/argentina.json',
                dataType : 'json',
                zoomOutControlId : 'zoomout',
                layers : {
                    provinces : {
                        geometriesClass : 'province',
                        clickToZoom : true,
                        onClick : function() {
                            self.selection.province = this.properties.ID_1;
                            causeOfDeathAreaChart.draw();
                        },
                        onZoomOut : function() {
                            self.selection.province = null;
                            causeOfDeathAreaChart.draw();
                        }
                    }
                },

                onLoad : function() {
                    app.calculateQuartiles();
                    d3choropleth.colorize("provinces", d3choropleth.currentColorGorup, function() {
                        return self.quartile(this.properties.ID_1);
                    });
                }
            });
        });

        // Death rate line chart
        deathRateLineChart.draw("deathRate", {
            margin : {top: 5, left : 25, right: 15}
        });

        app.getRatesIndex = function() {
            var ratesIndex = app.selection.cause ? getCauseIndex() : 8;
            return ratesIndex;
        }

        function getCauseIndex() {
            for (var i=0; i<app.causesArray.length; i++) {
                if (app.causesArray[i].key == app.selection.cause.key) {
                    return i;
                }
            }
        }

        app.quartile = function(provinceId) {
            var yearIndex = app.selection.year-2006;
            var ratesIndex = app.getRatesIndex();       //TODO(gb): optimize: this shouldn't be calle don every quartile call
            var rate = app.ratesData[ratesIndex].values[provinceId-1].values[yearIndex].values;

            for (var i=0; i<app.quartiles.length; i++) {
                if (rate < app.quartiles[i]) {
                    return i;
                }
            }

            return app.quartiles.length;
        }

        function processRateData(data) {
            var revisedData = [];

            // Process data
            data.forEach(function (d) {
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

            var deathByProvincesByYearByCause = d3.nest()
                .key(function (d) {
                    return d.cause
                })
                .key(function (d) {
                    return d.provincia
                })
                .key(function (d) {
                    return d.anio
                })
                .rollup(function (d) {
                    var val = parseFloat(d[0].value);
                    return val ? val : 0.0;
                })
                .entries(revisedData);

            var total = {};
            total.key = "total";
            total.values = deathByProvincesByYearByCause[0].values;

            for (var i=1; i<deathByProvincesByYearByCause.length; i++) {
                var cause = deathByProvincesByYearByCause[i];
                for (var j=0; j<cause.values.length; j++) {
                    var year = cause.values[j].values;
                    var totalYear = total.values[j].values;
                    for (var k=0; k<year.length; k++) {
                        totalYear[k].values += year[k].values;
                    }
                }
            }
            deathByProvincesByYearByCause.push(total);

            return deathByProvincesByYearByCause;
        }

        app.calculateQuartiles = function() {
            var rates = app.ratesData[app.getRatesIndex()];
            var ratesArray = [];

            for (var i=0; i<(rates.values.length - 1); i++) {
                ratesArray.push(rates.values[i].values[app.selection.year-2006].values);
            }
            ratesArray.sort(function(a, b) { return (a-b) });

            app.quartiles = [];
            app.quartiles[0] = ratesArray[ratesArray.length/4];
            app.quartiles[1] = ratesArray[ratesArray.length/4*2];
            app.quartiles[2] = ratesArray[ratesArray.length/4*3];

            $("#q0").text("0.0 - " + app.quartiles[0].toFixed(1));
            $("#q1").text(app.quartiles[0].toFixed(1) + " - " + app.quartiles[1].toFixed(1));
            $("#q2").text(app.quartiles[1].toFixed(1) + " - " + app.quartiles[2].toFixed(1));
            $("#q3").text(app.quartiles[2].toFixed(1) + " - " + ratesArray[ratesArray.length-1].toFixed(1));
        }


    };
})()
