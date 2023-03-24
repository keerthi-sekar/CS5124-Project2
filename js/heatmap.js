class Heatmap {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data, _xgroup, _ygroup) {
      // Configuration object with defaults
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 500,
        containerHeight: _config.containerHeight || 500,
        margin: _config.margin || {top: 10, right: 20, bottom: 40, left: 50},
        reverseOrder: _config.reverseOrder || false,
        tooltipPadding: _config.tooltipPadding || 15,
        xAxisTitle: _config.xAxisTitle || 'Service Code',
        yAxisTitle: _config.yAxisTitle || 'ZipCode',
      }
      this.data = _data;
      this.xGroup = _xgroup;
      this.yGroup = _ygroup;
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

      let x_keys = this.xGroup.keys();
      let y_keys = this.yGroup.keys();
  
      // Initialize scales and axes
      
      // Important: we flip array elements in the y output range to position the rectangles correctly
      vis.yScale = d3.scaleBand()
          .range([vis.height, 0])
          .domain(y_keys)
          .paddingInner(0.2); 
  
      vis.xScale = d3.scaleBand()
          .range([0, vis.width])
          .domain(x_keys)
          .paddingInner(0.2);
  
      vis.xAxis = d3.axisBottom(vis.xScale);
  
      vis.yAxis = d3.axisLeft(vis.yScale);
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
      // SVG Group containing the actual chart; D3 margin convention
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
          
  
      // Append empty x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chart.append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0,${vis.height})`);
  
      // Append y-axis group 
      vis.yAxisG = vis.chart.append('g')
          .attr('class', 'axis y-axis');

      var colors = ['#00876c', '#419b73', '#68af7a', '#8dc282', '#b2d58c', '#fffaa8', '#fcdd89', '#f8bf70', '#f3a15e', '#ec8253', '#e26150', '#d43d51'];
      vis.zScale = d3.scaleQuantile()
        .range(colors);
  
      // Append axis title
      vis.chart.append('text')
          .attr('class', 'axis-title')
          .attr('x', -10)
          .attr('y', -10)
          .attr('dy', '.71em')
          .text(vis.config.yAxisTitle);
  
      vis.chart.append('text') //x-axis = radius [dist]
        .attr('class', 'axis-title')
        .attr('y', vis.height + 25)
        .attr('x', vis.width + 5)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(vis.config.xAxisTitle);

      
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
        
      const square = vis.chart.selectAll('.rect')
            .data(this.data, function(d) {return d.ServiceCode+':'+d.Zipcode;})
            .enter()  
            .classed('squares', true)
            .attr('transform', 'translate(2,2)')
            .attr("fill", this.zScale(d.Zipcode))
            .attr('stroke', "black")
            .selectAll('rect')
            .data(dataset)
            .join('rect')
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            //.style("fill", function(d) { return myColor(d.value)} )
      square
        .on('mouseover', (event,d) => {
            d3.select('#tooltip')
            .html("The exact value of<br>this cell is: ")
            .style("left", (event.x)/2 + "px")
            .style("top", (event.y)/2 + "px")
        })
        .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
        });
      
      // Update axes
      vis.xAxisG.call(vis.xAxis);
      vis.yAxisG.call(vis.yAxis);
    }
  }