(function () {
    pieChart = {};

    var defaults = {divId: "pieChart", w: 150, h: 150, r: 70, color: d3.scale.category20c()};

    pieChart.createPieChart = function (options,data) {

        var aPieChart = {};
        var self = aPieChart;
        self.options = $.extend(defaults, options);

        aPieChart['update'] = function (data) {
            var self = this;
            self.path = self.path.data(self.pie(data)); // update the data


            self.path.enter().append("path")
                .attr("fill", function (d, i) {
                    return self.options.color(i);
                })
                .attr("d", this.arc)
                .each(function (d) {
                    this._current = d;
                }); // store the initial values


            self.path.transition().duration(750).attrTween("d", function (a) {
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function (t) {
                    return self.arc(i(t));
                };
            });


            self.path.exit().transition().duration(750).attrTween("d",function (a) {
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function (t) {
                    return self.arc(i(t));
                };
            }).remove();

        }

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
            }); // store the initial values

        return aPieChart;
    }


})();