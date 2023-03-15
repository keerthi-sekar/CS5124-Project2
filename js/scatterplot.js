class Scatterplot {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 500,
        containerHeight: _config.containerHeight || 500,
        margin: _config.margin || {top: 15, right: 15, bottom: 50, left: 50},
        tooltipPadding: _config.tooltipPadding || 10
      }
      this.data = _data;
      this.initVis();
    }
    
    /**
     * We initialize scales/axes and append static elements, such as axis titles.
     */
    initVis() {
      let vis = this;
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      vis.xScale = d3.scaleLinear() 
          .domain([10, 10000])
          .range([0, vis.width]);
  
      vis.yScale = d3.scaleLinear() 
          .domain([10, 10000])
          .range([vis.height, 0]);
  
      // Initialize axes
      vis.xAxis = d3.axisBottom(vis.xScale)

  
      vis.yAxis = d3.axisLeft(vis.yScale)

      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
      // Append group element that will contain our actual chart 
      // and position it according to the given margin config
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  
      // Append empty x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chart.append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0,${vis.height})`);
      
      // Append y-axis group
      vis.yAxisG = vis.chart.append('g')
          .attr('class', 'axis y-axis');
  
      // Append both axis titles
      vis.chart.append('text') //x-axis = radius [dist]
          .attr('class', 'axis-title')
          .attr('y', vis.height + 25)
          .attr('x', vis.width + 5)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text('Axis X');
  
      vis.svg.append('text') //y-axis = mass [hours]
          .attr('class', 'axis-title')
          .attr('x', 0)
          .attr('y', 0)
          .attr('dy', '.71em')
          .text('Axis Y');
    }
  
    /**
     * Prepare the data and scales before we render it.
     */
    updateVis() {
      let vis = this;
      
      // Specificy accessor functions
      vis.colorValue = d => d.STATUS;
      vis.xValue = d => d.LONGITUDE;
      vis.yValue = d => d.LATITUDE;
  
      // Set the scale input domains
      vis.xScale.domain([0, d3.max(vis.data, vis.xValue)]);
      vis.yScale.domain([0, d3.max(vis.data, vis.yValue)]);
  
      vis.renderVis();
    }
    
    renderVis() {
      let vis = this;
  
      // Add circles
      const circles = vis.chart.selectAll('.point')
          .data(vis.data, d => d.LONGITUDE)
        .join('circle')
          .attr('class', 'point')
          .attr('r', 4)
          .attr('cy', d => vis.yScale(vis.yValue(d)))
          .attr('cx', d => vis.xScale(vis.xValue(d)))
          .attr('fill', '#023020');
  
      // Tooltip event listeners
      circles
      .on('mouseover', (event,d) => {
        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          .html(`
            <div class="tooltip-title">${d.SERVICE_REQUEST_ID}</div>
            <div><i>Longitude ${d.LONGITUDE}, Latitude ${d.LATITUDE}</i></div>
          `);
        /* d3.select('#datatable')
          .html(`
            <tr>
              <th>Planet Name</th>
              <th>Discovery Year</th>
              <th>Spectral Type</th>
              <th>Distance</th>
              <th>Facility</th>
            </tr>
            <tr id="datarow">
              <td>${d.pl_name}</td>
              <td>${d.disc_year}</td>
              <td>${d.st_spectype}</th>
              <td>${Math.round(d.sy_dist)/100}</td>
              <td>${d.disc_facility}</td>
            </tr>
          `); */
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
      });
      
      // Update the axes/gridlines
      // We use the second .call() to remove the axis and just show gridlines
      vis.xAxisG
          .call(vis.xAxis)
          .call(g => g.select('.domain').remove());
  
      vis.yAxisG
          .call(vis.yAxis)
          .call(g => g.select('.domain').remove())
    }
  }