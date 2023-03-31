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
        containerWidth: _config.containerWidth || 400,
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
      // vis.layout = d3.layout.cloud()
      //   .size([vis.width, vis.height])
      //   .words(this.num_map.map(function(d, e) {return {text: d}}))
      //   .padding(5)
      //   .fontSize(60)
      //   .on("end", draw);
      
      // vis.layout.start();

      vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

      // // SVG Group containing the actual chart; D3 margin convention
      // vis.chart = vis.svg.append('g')
      //   .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`)
      //   .selectAll("text")
      //     .data(words)
      //   .enter().append("text")
      //     .style("font-size", function(d){return d.size + "px";})
      //     .attr("text-anchor", "middle")
      //     .attr("transform", function(d){
      //       return "translate(" + [d.x, d.y] + ")rotate(" + + d.rotate + ")";
      //     })
      //   .text(function(d){return d.text;});

      vis.fill = d3.scaleOrdinal().range(d3.schemeCategory10)
      var data = [
        {text: "Hello", value:6260},
        {text: "happy", value:5370},
        {text: "beautiful", value:2480},
        {text: "rainbow", value:4350},
        {text: "unicorn", value:1250},
        {text: "glitter", value:3140},
        {text: "happy", value:990},
        {text: "pie", value:4230}];

      var layout = d3.layout.cloud()
        .size([400, 300])
        .words(data)
        .on("end", function() {
          d3.select("#wordcloud")
          .append("g")
          .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
          .selectAll("text")
          .data(data)
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
      // var colorScale = vis._width > 800 ?  d => vis.colorScale(vis.colorValue(d)) : "#023020";
      
    }
  }