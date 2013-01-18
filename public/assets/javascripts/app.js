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

    app.provinceCodesArray= [
        {key: 'Ciud. Aut. de  Buenos Aires', value: 5} ,
        {key: 'Buenos Aires', value: 1},
        {key: 'Catamarca', value: 2},
        {key: 'Córdoba', value: 6},
        {key: 'Corrientes', value: 7},
        {key: 'Chaco', value: 3},
        {key: 'Chubut', value: 4},
        {key: 'Entre Ríos', value: 8},
        {key: 'Formosa', value: 9},
        {key: 'Jujuy', value: 10},
        {key: 'La Pampa', value: 11},
        {key: 'La Rioja', value: 12},
        {key: 'Mendoza', value: 13} ,
        {key: 'Misiones', value: 14},
        {key: 'Neuquén', value: 15} ,
        {key: 'Río Negro', value: 16},
        {key: 'Salta', value: 17},
        {key: 'San Juan', value: 18},
        {key: 'San Luis', value: 19},
        {key: 'Santa Cruz', value: 20},
        {key: 'Santa Fe', value: 21},
        {key: 'Santiago del Estero', value: 22},
        {key: 'Tucumán', value: 24},
        {key: 'Tierra del Fuego', value: 23}];

    app.provinceMap = {};
    for(var i=0;i<app.provinceCodesArray.length;i++){
        app.provinceMap[app.provinceCodesArray[i].key]=app.provinceCodesArray[i].value;
    }
    app.provinceMapByCode = {};

    for(var i=0;i<app.provinceCodesArray.length;i++){
        app.provinceMapByCode[app.provinceCodesArray[i].value]=app.provinceCodesArray[i].key;
    }

    //TODO: refactor dnul
    app.zoomLocationsArray = [
        {key: 1, x: -10.262613679925508, y: 55.13908237968489, k: 4},
        {key: 2, x: 60.51751378532765, y: 178.39683202528224, k: 4},
        {key: 3, x: -8.197135564735905, y: 190.2362675218981, k: 4},
        {key: 4, x: 78.12741016923607, y: -48.233265327752726, k: 4},
        {key: 5, x: -33.9395141320074, y: 84.09937360502019, k: 4},
        {key: 6, x: 25.558180799210795, y: 116.61518530866319, k: 4},
        {key: 7, x: -41.00192544990495, y: 160.313361317873, k: 4},
        {key: 8, x: -25.442897347780924, y: 118.11579366215383, k: 4},
        {key: 9, x: -17.47160090404908, y: 208.67680233895467, k: 4},
        {key: 10, x: 47.35132588114778, y: 227.92945311718393, k: 4},
        {key: 11, x: 43.88367070570077, y: 49.37379332281916, k: 4},
        {key: 12, x: 63.0320368644745, y: 148.7362825677017, k: 4},
        {key: 13, x: 78.77257165181865, y: 83.51160723558354, k: 4},
        {key: 14, x: -76.10387121654735, y: 184.26663952424258, k: 4},
        {key: 15, x: 95.8175278659974, y: 28.06552419374777, k: 4},
        {key: 16, x: 63.770288136828746, y: 2.619883357707074, k: 4},
        {key: 17, x: 36.96218151449586, y: 215.9362653198231, k: 4},
        {key: 18, x: 81.94345613572776, y: 133.52931035069435, k: 4},
        {key: 19, x: 50.321284311148425, y: 95.19480963299873, k: 4},
        {key: 20, x: 94.00511536863121, y: -129.93778266090325, k: 4},
        {key: 21, x: -6.0090172087551235, y: 135.12394188436474, k: 4},
        {key: 22, x: 19.553569305357566, y: 172.7488932167182, k: 4},
        {key: 23, x: 65.49965885548255, y:-227.61906276727228, k:4},
        {key: 24, x: 42.967983972762646, y: 183.4353299256579, k: 4}
    ];

    app.zoomLocationsMap = {};
    for(var i=0;i<app.zoomLocationsArray.length;i++){
        var searchKey = app.zoomLocationsArray[i].key;
        for( var j = 0;j< app.provinceCodesArray.length;j++){
            if(app.provinceCodesArray[j].value==searchKey){
                app.zoomLocationsMap[app.provinceCodesArray[j].key]=app.zoomLocationsArray[searchKey-1];
            }
        }
    }

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
                app.drawChartLegends();
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
                            app.drawChartLegends();
                        },
                        onZoomOut : function() {
                            self.selection.province = null;
                            causeOfDeathAreaChart.draw();
                            app.drawChartLegends();
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

        app.drawChartLegends = function(){


            var location = app.selection.province?app.provinceMapByCode[app.selection.province]:null;
            var causa = app.selection.cause?app.selection.cause:null;

            var razon_title='Razón de la muerte materna nacional (RMM)' + (app.selection.province==null?'': ' en ' + location) + (app.selection.cause!=null?' para muertes por ' + causa.text:'');
            var evolucion_title='Evolución de la razón de muerte materna (RMM) por causa' + (app.selection.province==null?'': ' en ' + location);

            $('#razon_title').text(razon_title);
            $('#evolucion_title').text(evolucion_title);


        }


    };
})()
