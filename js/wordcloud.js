class WordCloud {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      // Configuration object with defaults
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 1500,
        containerHeight: _config.containerHeight || 600,
        margin: _config.margin || {top: 25, right: 20, bottom: 40, left: 50},
        reverseOrder: _config.reverseOrder || false,
        tooltipPadding: _config.tooltipPadding || 15,
        xAxisTitle: _config.xAxisTitle || 'NaN',
        yAxisTitle: _config.yAxisTitle || 'Calls',
      }
      this.data = _data;
      this.initVis();
    }
    
    /**
     * Initialize scales/axes and append static elements, such as axis titles
     */
    initVis() {
      let vis = this;
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

      vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

      vis.fill = d3.scaleOrdinal().range(d3.schemeCategory10)

      vis.data = vis.data.map(function(d) {
        return {text: d[0], value: d[1]*100};
      })

      
      vis.updateVis();
  
     
    }

    draw(words) {
      d3.select("#wordcloud")
          .append("g")
          .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
          .selectAll("text")
          .data(words)
          .enter()
          .append("text")
          .text((d) => d.text)
          .style("font-size", (d) => d.size + "px")
          .style("font-family", (d) => d.font)
          .style("fill", (d, i) => fill(i))
          .attr("text-anchor", "middle")
          .attr("transform", (d) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")");
    }
  
    /**
     * Prepare data and scales before we render it
     */
    updateVis() {
      let vis = this;
  
      
  
      vis.renderVis();
    }
  
    /**
     * Bind data to visual elements
     */
    renderVis() {
      let vis = this;
      var layout = d3.layout.cloud()
      .size([1500, 600])
      .words(vis.data)
      .on("end", function() {
        d3.select("#wordcloud")
        .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
        .data(vis.data)
        .enter()
        .append("text")
        .text((d) => d.text)
        .style("font-size", (d) => d.size + "px")
        .style("font-family", (d) => d.font)
        .style("fill", (d, i) => vis.fill(i))
        .attr("text-anchor", "middle")
        .attr("transform", (d) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")");
      });

    layout.start();
      
    }
  }