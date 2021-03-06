/*global d3:false, baseUrl:false */
/*jshint eqnull:true */

window.SonarWidgets = window.SonarWidgets == null ? {} : window.SonarWidgets;

(function () {

  window.SonarWidgets.PieChart = function () {
    // Set default values
    this._components = [];
    this._metrics = [];
    this._metricsPriority = [];
    this._width = window.SonarWidgets.PieChart.defaults.width;
    this._height = window.SonarWidgets.PieChart.defaults.height;
    this._margin = window.SonarWidgets.PieChart.defaults.margin;
    this._legendWidth = window.SonarWidgets.PieChart.defaults.legendWidth;

    this._lineHeight = 20;


    // Export global variables
    this.metrics = function (_) {
      return param.call(this, '_metrics', _);
    };

    this.metricsPriority = function (_) {
      return param.call(this, '_metricsPriority', _);
    };

    this.components = function (_) {
      return param.call(this, '_components', _);
    };

    this.width = function (_) {
      return param.call(this, '_width', _);
    };

    this.height = function (_) {
      return param.call(this, '_height', _);
    };

    this.margin = function (_) {
      return param.call(this, '_margin', _);
    };

    this.legendWidth = function (_) {
      return param.call(this, '_legendWidth', _);
    };
  };

  window.SonarWidgets.PieChart.prototype.render = function (container) {
    var widget = this,
        containerS = container;

    container = d3.select(container);

    this.width(container.property('offsetWidth'));

    this.svg = container.append('svg')
        .attr('class', 'sonar-d3');
    this.gWrap = this.svg.append('g');

    this.plotWrap = this.gWrap.append('g');

    this.gWrap
        .attr('transform', trans(this.margin().left, this.margin().top));


    // Configure metrics
    this.mainMetric = this.metricsPriority()[0];
    this.getMainMetric = function(d) {
      return d.measures[widget.mainMetric].val;
    };


    // Configure scales
    this.color = d3.scale.category20();


    // Configure arc
    this.arc = d3.svg.arc()
        .innerRadius(0);


    // Configure pie
    this.pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return widget.getMainMetric(d); });


    // Configure sectors
    this.sectors = this.plotWrap.selectAll('.arc')
        .data(this.pie(this.components()))
        .enter().append('g').attr('class', 'arc');

    this.sectors.append('path')
        .style('fill', function(d, i) { return widget.color(i); });


    // Configure legend
    this.legendWrap = this.gWrap.append('g')
        .attr('width', this.legendWidth());

    this.legends = this.legendWrap.selectAll('.legend')
        .data(this.components());

    this.legends.enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) { return trans(0, 10 + i * widget._lineHeight); });

    this.legends.append('circle')
        .attr('class', 'legend-bullet')
        .attr('r', 4)
        .style('fill', function(d, i) { return widget.color(i); });

    this.legends.append('text')
        .attr('class', 'legend-text')
        .attr('transform', trans(10, 3))
        .text(function(d) { return d.name; });


    // Configure details
    this._detailsHeight = this._lineHeight * 4;

    this.detailsWrap = this.gWrap.append('g')
        .attr('width', this.legendWidth());

    this.detailsColorIndicator = this.detailsWrap.append('rect')
        .classed('details-color-indicator', true)
        .attr('transform', trans(-1, 0))
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 3)
        .attr('height', this._detailsHeight)
        .style('opacity', 0);


    // Configure events
    var enterHandler = function(sector, legend, d, i) {
          var scaleFactor = (widget.radius + 5) / widget.radius;
          d3.select(legend)
              .classed('legend-active', true);
          d3.select(sector)
              .classed('arc-active', true)
              .style('-webkit-transform', 'scale(' + scaleFactor + ')');

          var metrics = widget.metricsPriority().map(function(m) {
            return {
              name: widget.metrics()[m].name,
              value: d.measures[m].val
            };
          });
          updateMetrics(metrics);

          widget.detailsColorIndicator
              .style('opacity', 1)
              .style('fill', widget.color(i));
        },

        leaveHandler = function(sector, legend) {
          d3.select(legend).classed('legend-active', false);
          d3.select(sector)
              .classed('arc-active', false)
              .style('-webkit-transform', 'scale(1)');
          widget.detailsColorIndicator
              .style('opacity', 0);
          widget.detailsMetrics
              .style('opacity', 0);
        },

        updateMetrics = function(metrics) {

          widget.detailsMetrics = widget.detailsWrap.selectAll('.details-metric')
              .data(metrics);

          widget.detailsMetrics.enter().append('text')
              .classed('details-metric', true)
              .classed('details-metric-main', function(d, i) { return i === 0; })
              .attr('transform', function(d, i) { return trans(10, i * widget._lineHeight); })
              .attr('dy', '1.2em');

          widget.detailsMetrics
              .text(function(d) { return d.name + ': ' + d.value; })
              .style('opacity', 1);

          widget.detailsMetrics.exit().remove();
        };

    this.legends
        .on('mouseenter', function(d, i) {
          return enterHandler(widget.sectors[0][i], this, d, i);
        })
        .on('mouseleave', function(d, i) {
          return leaveHandler(widget.sectors[0][i], this);
        });

    this.sectors
        .on('mouseenter', function(d, i) {
          return enterHandler(this, widget.legends[0][i], d.data, i);
        })
        .on('mouseleave', function(d, i) {
          return leaveHandler(this, widget.legends[0][i]);
        });


    // Update widget
    this.update(containerS);

    return this;
  };



  window.SonarWidgets.PieChart.prototype.update = function(container) {
    container = d3.select(container);

    var widget = this,
        width = container.property('offsetWidth');
    this.width(width > 100 ? width : 100);


    // Update svg canvas
    this.svg
        .attr('width', this.width())
        .attr('height', this.height());


    // Update available size
    this.availableWidth = this.width() - this.margin().left - this.margin().right - this.legendWidth();
    this.availableHeight = this.height() - this.margin().top - this.margin().bottom;


    // Update radius
    this.radius = Math.min(this.availableWidth, this.availableHeight) / 2;


    // Update plot
    this.plotWrap
        .attr('transform', trans(this.radius, this.radius));


    // Update arc
    this.arc
        .outerRadius(this.radius);


    // Update legend
    this.legendWrap
        .attr('transform', trans(20 + this.radius * 2, 0 ));


    // Update details
    this.detailsWrap
        .attr('transform', trans(20 + this.radius * 2, this.availableHeight - this._detailsHeight ));


    // Update sectors
    this.sectors.selectAll('path')
        .transition()
        .attr('d', this.arc);
  };



  window.SonarWidgets.PieChart.defaults = {
    width: 350,
    height: 300,
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    legendWidth: 250
  };



  // Some helper functions

  // Gets or sets parameter
  function param(name, value) {
    if (value == null) {
      return this[name];
    } else {
      this[name] = value;
      return this;
    }
  }

  // Helper for create the translate(x, y) string
  function trans(left, top) {
    return 'translate(' + left + ', ' + top + ')';
  }

})();
