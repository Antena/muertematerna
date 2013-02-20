(function () {
    pieChart = {};

    var defaults = {divId: "pieChart", w: 150, h: 150, r: 70, color: d3.scale.category20c()};

    pieChart.createPieChart = function (options,data,labels) {

        var aPieChart = {};
        var self = aPieChart;
        self.options = $.extend(defaults, options);
        self.labels = labels;

        aPieChart['update'] = function (data) {
            var self = this;
            self.newData = data;
            self.path = self.path.data(self.pie(data)); // update the data


            self.path.enter().append("path")
                .attr("fill", function (d, i) {
                    return (app.selection.selectionSize>0?self.options.color(i):"#aaa");
                })
                .attr("d", this.arc)
                .each(function (d) {
                    this._current = d;
                }); // store the initial values


            self.path.transition().duration(750).attrTween("d",function (a) {
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function (t) {
                    return self.arc(i(t));
                }
            }).attr("fill", function (d, i) {
                    return (app.selection.selectionSize>0?self.options.color(i):"#aaa");
                });
            ;


            self.path.exit().transition().duration(750).attrTween("d",function (a) {
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function (t) {
                    return self.arc(i(t));
                };
            }).remove();

        }


        self.newData = data;


        self.arc = d3.svg.arc()
            .outerRadius(self.options.r);

        self.vis = d3.select("#" + self.options.divId).append("svg")
            .attr("width", self.options.w)
            .attr("height", self.options.h)
            .append("g")
            .attr("transform", "translate(" + self.options.w / 2 + "," + self.options.h / 2 + ")");

        self.pie = d3.layout.pie()
            .sort(null);

        self.path = self.vis.selectAll("path")
            .data(self.pie(data))
            .enter().append("path")
            .attr("fill", function (d, i) {
                return self.options.color(i);
            })
            .attr("d", self.arc)
            .each(function (d) {
                this._current = d;
            }).tooltip(function (d, i) {
                var content = $("<div></div>");
                var tooltip = $("<div id='tooltipData'></div>");
                tooltip.append("<h5>" + self.labels[i] + "</h5>");
                tooltip.append("<h4>" + (self.newData[i] * 100).toFixed(2) + "%</h4>");
                content.append(tooltip);
                return {
                    class: "pieChartTip",
                    type: "mouse",
                    gravity: "down",
                    content: content.html(),
                    displacement: [0, 15],
                    show: function () {
                        return true;
                    },
                    updateContent: function (tip) {
                        var content = $("<div id='tooltipData'></div>");
                        content.empty();
                        content.append("<h5>" + self.labels[i] + "</h5>");
                        content.append("<h4>" + (self.newData[i] * 100).toFixed(2) + "%</h4>");
                        $("#tooltipData").html(content.html());
                    }
                }
            }); // store the initial values

        return aPieChart;
    }


})();