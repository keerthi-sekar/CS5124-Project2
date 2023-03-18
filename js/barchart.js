class Barchart {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data, _map) {
      // Configuration object with defaults
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 500,
        containerHeight: _config.containerHeight || 500,
        margin: _config.margin || {top: 10, right: 20, bottom: 40, left: 50},
        reverseOrder: _config.reverseOrder || false,
        tooltipPadding: _config.tooltipPadding || 15,
        xAxisTitle: _config.xAxisTitle || 'NaN',
        yAxisTitle: _config.yAxisTitle || 'Calls',
      }
      this.data = _data;
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
      
      // Important: we flip array elements in the y output range to position the rectangles correctly
      vis.yScale = d3.scaleLinear()
          .range([vis.height, 0]); 
  
      vis.xScale = d3.scaleBand()
          .range([0, vis.width])
          .paddingInner(0.2);
  
      vis.xAxis = d3.axisBottom(vis.xScale)
          .ticks(data)
          .tickSizeOuter(0);
  
      vis.yAxis = d3.axisLeft(vis.yScale)
          .ticks(5)
          .tickSizeOuter(0)
  
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
      //.text(vis.config.xAxisTitle);
    }
  
    /**
     * Prepare data and scales before we render it
     */
    updateVis() {
      let vis = this;
  
      if (vis.config.reverseOrder) {
        vis.data.reverse();
      }
  
      // Prepare data: count number of trails in each difficulty category
      // i.e. [{ key: 'easy', count: 10 }, {key: 'intermediate', ...
      //const aggregatedDataMap = d3.rollups(vis.data, v => v.length, d => d.sy_snum);
      vis.aggregatedData = Array.from(vis.num_map, ([key, count]) => ({ key, count }));
  
      /*const orderedKeys = ['0','1','2','3', '4'];
      vis.aggregatedData = vis.aggregatedData.sort((a,b) => {
        return orderedKeys.indexOf(a.key) - orderedKeys.indexOf(b.key);
      });*/
  
      // Specificy accessor functions
      vis.xValue = d => d.key;
      vis.yValue = d => d.count;
  
      // Set the scale input domains
      vis.xScale.domain(vis.aggregatedData.map(vis.xValue));
      vis.yScale.domain([0, d3.max(vis.aggregatedData, vis.yValue)]);
  
      vis.renderVis();
    }
  
    /**
     * Bind data to visual elements
     */
    renderVis() {
      let vis = this;
  
      // Add rectangles
      const bars = vis.chart.selectAll('.bar')
          .data(vis.aggregatedData, vis.xValue)
        .join('rect')
          .attr('class', 'bar')
          .attr('x', d => vis.xScale(vis.xValue(d)))
          .attr('width', vis.xScale.bandwidth())
          .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
          .attr('y', d => vis.yScale(vis.yValue(d)))
          .attr('fill', '#023020')
  
      bars
        .on('mouseover', (event,d) => {
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(`
            <div class="tooltip-label">${d.key}</div>
              <div class="tooltip-label">Calls: ${d.count}</div>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });

      // Update axes
      vis.xAxisG.call(vis.xAxis);
      vis.yAxisG.call(vis.yAxis);
    }
  }