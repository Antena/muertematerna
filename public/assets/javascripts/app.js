(function() {

    var currentIndex = 24;

    app = {};

    app.causesArray = [
        { key:'aborto_razon', color:'#a8251d', colorGroup:'Reds', type:'direct', text:'Embarazo terminado en aborto',codmuer:[{from:0,to:7}] },
        { key:'hipert_razon', color:'#bf66b1', colorGroup:'PuRd', type:'direct', text:'Trastornos hipertensivos' ,codmuer:[{from:10,to:16}]},
        { key:'placenta_razon', color:'#486fb7', colorGroup:'Blues', type:'direct', text:'Trastornos de placenta y hemorragias',codmuer:[{from:44,to:46}] },
        { key:'hemorragias_razon', color:'#e6a827', colorGroup:'YlOrRd', type:'direct', text:'Hemorragia postparto',codmuer:[{from:72,to:72}]},
        { key:'sepsis_razon', color:'#b74c00', colorGroup:'Oranges', type:'direct', text:'Sepsis',codmuer:[{from:85,to:92}] },
        { key:'otras_directas_razon', color:'#6151a5', colorGroup:'Purples', type:'direct', text:'Otras causas directas',codmuer:[{from:20,to:29},{from:30,to:43},{from:47,to:48},{from:60,to:69},{from:70,to:71},{from:73,to:75},{from:95,to:95}] },
        { key:'vih_razon', color:'#ad5000', colorGroup:'YlOrBr', type:'indirect', text:'Enfermedad por VIH', codmuer:[{from:200,to:224}]},
        { key:'otras_ind_razon', color:'#789b41', colorGroup:'Greens', type:'indirect', text:'Otras causas indirectas', codmuer:[{from:98,to:99}] }
    ];

    app.causesReferenceLine = {
        color:"#666"
    };


    app.nationalRates = [
        { year: 2006, rate: 4.8 },
        { year: 2007, rate: 4.4 },
        { year: 2008, rate: 4.0 },
        { year: 2009, rate: 5.5 },
        { year: 2010, rate: 4.4 },
        { year: 2011, rate: 4.0 }
    ];

    app.quartiles = [];

    app.selection = {
        cause : null,
        province : null,
        year : 2011
    };


    app.setCause = function(cause){
        app.selection.cause = cause;
        var causeText = cause ? app._trunc(cause.text, 25, true) : "Todas";
        $("#selection_cause").text(causeText).attr("title", cause ? cause.text : "Todas");
        $("#map-title-suffix").text(cause ? "para muertes por " + cause.text : "");
        $("#cause-selector").find(".current").removeClass("current");
        if (cause) {
            $("#cause-selector").find("[data-key=" + cause.key + "]").addClass("current");
        }
        this.updateSelection();
    }

    app.getCause = function(){
        return app.selection.cause;
    }


    app.setProvince = function(province){
        app.selection.province = province;
        $("#selection_province").text(province ? province.key : "Todas");
        if (province) {
            d3choropleth.mute("provinces", "provinces" + province.value);
            $("#zoomout").css("visibility", "visible");
            app.setContext("province");
        } else {

        }

        this.updateSelection();
    }

    app.getProvince = function(){
        return app.selection.province;
    }

    app.setYear = function(year){
        app.selection.year = year;
        $("#selection_year").text(year);
        this.updateSelection();
    }

    app.getYear = function(){
        return app.selection.year;
    }

    app.updateSelection = function(){

        //update cause
        d3choropleth.update();
        if (app.selection.cause != null){
            causeOfDeathAreaChart.paintCauses();
        }
        causeOfDeathAreaChart.draw();
        app.drawChartTitles();
        filterPieCharts.drawPieCharts();
        if (app.selection.province != null) {
            provinceMap.update();
        }
    }

    app.ratesData = null;

    app.medicalCenters = [
        {x:15, y:-55, r:30},                // Buenos Aires
        {x:25, y:-120, r:25},               // Entre Rios
        {x:40, y:-160, r:18},               // Entre Rios
        {x:5, y:-135, r:5},                 // Santa Fe
        {x:-65, y:-150, r:32},              // La Rioja
        {x:-60, y:-180, r:12},              // Catamarca
        {x:-65, y:0, r:15}                  // Rio Negro
    ]

    app.init = function() {
        var self = this;

        d3.csv("/assets/data/razon_muertes.csv", function(data) {

            // Year slider
            $('#slider').slider({
                value : 2011,
                min : 2006,
                max : 2011,
                step : 1,
                slide : function(event, ui) {
                    app.setYear(ui.value);
                }
            })

            // Zoom out
            $('#zoomout').click(function(e){
                $("#zoomout").css("visibility", "hidden");
                self.setProvince(null);
                app.setContext("national");
                e.preventDefault();
            });

            // Reset area chart
            $('#resetarea').click(causeOfDeathAreaChart.reset);

            // Cause of death area chart
            causeOfDeathAreaChart.draw('causesByYear', {
                width: 300,
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
                        id : 'ID_1',
                        onClick : function() {
                            var province = provinces.getById(this.properties.ID_1);
                            self.setProvince(province);
                            $("#province-selector input").val("");
                        },
                        tooltip: function(d, i) {
                            var id;
                            id = d.properties.ID_1;

                            var content = $("<div></div>");
                            content.empty();
                            content.append("<h5>" + d.properties.NAME_1 + "</h5>");

                            // Province rate
                            var rate = app.ratesData[8].values[id-1].values[app.selection.year-2006].values.toFixed(1);
                            content.append('<div class="province-bar" style="width: ' + (rate * 10) + 'px"></div>');
                            content.append('<p>RMM: <span class="provinceRate">' + rate + '</span></p>');
                            content.append('<br/>');

                            // National rate
                            var nationalRate = app.nationalRates.filter(function(rate) { return rate.year == app.selection.year})[0].rate.toFixed(1);
                            content.append('<div class="national-bar" style="width: ' + (nationalRate * 10) + 'px"></div>');
                            content.append('<p>RMM: <span class="nationalRate">' + nationalRate + '</span></p>');

                            return {
                                class: "provinceTooltip",
                                type: "fixed",
                                gravity: "right",
                                content: content.html(),
                                show: function() {
                                    return !d3choropleth.isZoomedIn();
                                },
                                displacement: [5, 0],
                                updateContent: function() {
                                    var rate = app.ratesData[8].values[id-1].values[app.selection.year-2006].values.toFixed(1);
                                    $(".provinceTooltip").find("span.provinceRate").text(rate);
                                    $(".province-bar").css("width", rate*10);

                                    var nationalRate = app.nationalRates.filter(function(rate) { return rate.year == app.selection.year})[0].rate.toFixed(1);
                                    $(".provinceTooltip").find("span.nationalRate").text(nationalRate);
                                    $(".national-bar").css("width", nationalRate*10);
                                }
                            };
                        }
                    }
                },
                onLoad : function() {
                    app.calculateQuartiles();
                    d3choropleth.colorize("provinces", d3choropleth.currentColorGorup, function() {
                        return self.quartile(this.properties.ID_1);
                    });
                },
                update: function() {
                    //update cause
                    this.currentColorGorup = app.selection.cause == null ?
                        this.defaultColorGorup :
                        app.selection.cause.colorGroup;
                    app.calculateQuartiles(app.ratesData[app.getRatesIndex()]);

                    var onlyWithId = app.selection.province ?
                        "provinces" + app.selection.province.value :
                        null;

                    this.colorize("provinces", d3choropleth.currentColorGorup, function() {
                        return app.quartile(this.properties.ID_1);
                    }, onlyWithId);
                }
            });
        });

        // Death rate line chart
        deathRateLineChart.draw("deathRate", {
            width: 285,
            height: 200,
            margin : {top: 5, left : 25, right: 15}
        });
        filterPieCharts.drawPieCharts();

        // Province map
        provinceMap.init();

        app.getRatesIndex = function() {
            var ratesIndex = app.selection.cause ? getCauseIndex() : 8;
            return ratesIndex;
        }

        app.setContext = function(dimension, path) {
            if (dimension == "national") {
                $("#provinceContext").fadeOut(function() {
                    $("#nationalContext").fadeIn();
                })
            } else {
                $("#nationalContext").fadeOut(function() {
                    $("#provinceContext").fadeIn();
                })
            }
        };

        function getCauseIndex() {
            for (var i=0; i<app.causesArray.length; i++) {
                if (app.causesArray[i].key == app.selection.cause.key) {
                    return i;
                }
            }
        }

        app.quartile = function(provinceId) {
            var yearIndex = app.selection.year-2006;
            var ratesIndex = app.getRatesIndex();       //TODO(gb): optimize: this shouldn't be called on every quartile call
            var rate = app.ratesData[ratesIndex].values[provinceId-1].values[yearIndex].values;

            for (var i=0; i<app.quartiles.length; i++) {
                if (rate == 0) {
                    return 0;
                }
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
            total.values = $.extend(true, [], deathByProvincesByYearByCause[0].values);

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

            var zeroes = ratesArray.filter(function(element) { return element==0}).length;
            app.quartiles = [];
            var quartileIndexes = []
            if (zeroes >= 12 && zeroes < 18) {
                app.quartiles[0] = ratesArray[ratesArray.length/4*2];
                quartileIndexes[0] = ratesArray.length/4*2-1;
                app.quartiles[1] = ratesArray[ratesArray.length/4*3];
                quartileIndexes[1] = ratesArray.length/4*3-1;
            } else if (zeroes >= 18) {
                app.quartiles[0] = ratesArray[ratesArray.length/4*3];
                quartileIndexes[0] = ratesArray.length/4*3-1;
            } else {
                app.quartiles[0] = ratesArray[ratesArray.length/4];
                quartileIndexes[0] = ratesArray.length/4-1;
                app.quartiles[1] = ratesArray[ratesArray.length/4*2];
                quartileIndexes[1] = ratesArray.length/4*2-1
                app.quartiles[2] = ratesArray[ratesArray.length/4*3];
                quartileIndexes[2] = ratesArray.length/4*3-1;
            }

            $("#legend .legend-box").hide();
            for (var i=0; i<app.quartiles.length; i++) {
                var elementsInQuartile = ratesArray.filter(function(element) { return element <= ratesArray[quartileIndexes[i]] });
                elementsInQuartile.splice(0,elementsInQuartile.length-6);

                var legendBox = $("#q"+i).show();
                legendBox.find(".box-label").text(buildLegendText(elementsInQuartile, app.quartiles[i], i==0));
            }
            var elementsInQuartile = ratesArray.filter(function(element) { return element <= ratesArray[ratesArray.length-1] });
            elementsInQuartile.splice(0,elementsInQuartile.length-6);
            var legendBox = $("#q"+i).show();
            legendBox.find(".box-label").text(buildLegendText(elementsInQuartile, ratesArray[ratesArray.length-1]));
        }

        function buildLegendText(rates, limit, first) {
            var minRate = Math.min.apply(null, rates).toFixed(2);
            var maxRate = Math.max.apply(null, rates).toFixed(2);
            var lowerBound = first ? minRate : minNotZero(rates).toFixed(2);
            var upperBound = limit.toFixed(2);
            var legendText = minRate == maxRate  ?
                minRate :
                lowerBound + " - " + upperBound;

            return legendText;
        }

        function minNotZero(values) {
            var min = 0;
            values.map(function(element) {
                if (min > 0) {
                    min = element < min ? element : min;
                } else {
                    min = element;
                }
            })

            return min;
        }

        app._trunc = function(str, n,useWordBoundary) {
            var toLong = str.length>n,
                s_ = toLong ? str.substr(0,n-1) : str;
            s_ = useWordBoundary && toLong ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
            return  toLong ? s_ + '...' : s_;
        }

        app.drawChartTitles = function() {
            var location = app.selection.province ? app.selection.province.key : null;
            var causa = app.selection.cause?app.selection.cause:null;

            var razon_title = (app.selection.province == null ? 'país ':' ') + (app.selection.province==null?'': ' de ' + location) + (app.selection.cause!=null?' para muertes por ' + causa.text:'');
            var evolucion_title = (app.selection.province == null ? '' : ' en ' + location);

            $('#razon_title').text(razon_title);
            $('#evolucion_title').text(evolucion_title);
        }
    };
})()
