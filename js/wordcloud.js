class WordCloud {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _map, _width) {
      // Configuration object with defaults
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || _width,
        containerHeight: _config.containerHeight || 500,
        margin: _config.margin || {top: 25, right: 20, bottom: 40, left: 50},
        reverseOrder: _config.reverseOrder || false,
        tooltipPadding: _config.tooltipPadding || 15,
        xAxisTitle: _config.xAxisTitle || 'NaN',
        yAxisTitle: _config.yAxisTitle || 'Calls',
      }
      this.num_map = _map;
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
  

      // Initialize scales and axes
      vis.layout = d3.cloud()
        .size([vis.width, vis.height])
        .words(this.num_map.map(function(d, e) {return {text: d}}))
        .padding(5)
        .fontSize(60)
        .on("end", draw);
      
      vis.layout.start();

      vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

      // SVG Group containing the actual chart; D3 margin convention
      vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`)
        .selectAll("text")
          .data(words)
        .enter().append("text")
          .style("font-size", function(d){return d.size + "px";})
          .attr("text-anchor", "middle")
          .attr("transform", function(d){
            return "translate(" + [d.x, d.y] + ")rotate(" + + d.rotate + ")";
          })
        .text(function(d){return d.text;});
      
      vis.updateVis();
  
     
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
      // var colorScale = vis._width > 800 ?  d => vis.colorScale(vis.colorValue(d)) : "#023020";
      
    }
  }