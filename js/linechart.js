class LineChart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || {top: 20, right: 20, bottom: 30, left: 50}
    }
    this.data = _data;
    this.initVis();
  }
  
  /**
   * Initialize scales/axes and append static chart elements
   */
  initVis() {
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.xScale = d3.scaleUtc()
        .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0])
        .nice();

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        // .ticks(6)
        .tickSizeOuter(0)
        .tickPadding(10)

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(4)
        .tickSizeOuter(0)
        .tickPadding(10);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart (see margin convention)
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'y-axis');

    // We need to make sure that the tracking area is on top of other chart elements
    vis.trackingArea = vis.chart.append('rect')
    .attr('width', vis.width)
    .attr('height', vis.height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all');

    // Empty tooltip group (hidden by default)
    vis.tooltip = vis.chart.append('g')
        .attr('class', 'tooltip')
        .style('display', 'none');

    vis.tooltip.append('circle')
        .attr('r', 4);

    vis.tooltip.append('text');

    vis.chart.append('text')
      .attr('class', 'title')
      .attr('x', vis.width / 2)
      .attr('y', vis.config.margin.top / 40)
      .attr('text-anchor', 'middle')
      //.text("Discoveries over Time");

    vis.chart.append("text")
      .attr("class", "xlabel")
      .attr("text-anchor", "middle")
      .attr("x",vis. width/2)
      .attr("y", vis.height + 40)
      //.text("Time (years)");

    vis.chart.append("text")
      .attr('class', 'ylabel')
      //.text("Number of Discoveries")
      .attr('transform', 'rotate(-90)')
      .attr('x', -((vis.height + vis.config.margin.top + vis.config.margin.bottom + 90) / 2))
      .attr('y', -50) // Relative to the y axis.
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    
    vis.xValue = d => new Date(d[0]);
    vis.yValue = d => d[1];

    vis.line = d3.line()
        .x(d => vis.xScale(vis.xValue(d)))
        .y(d => vis.yScale(vis.yValue(d)));

    // Set the scale input domains
    console.log(vis.data)
    vis.xScale.domain(d3.extent(vis.data, vis.xValue));
    vis.yScale.domain(d3.extent(vis.data, vis.yValue));

    vis.bisectDate = d3.bisector(vis.xValue).left;  

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;

    // Add line path
    vis.marks = vis.chart.selectAll('.chart-line')
        .data([vis.data])
      .join('path')
        .attr('stroke', '#525252')
        .attr('fill', 'none')
        .attr('class', 'chart-line')
        .attr('d', vis.line);

    vis.trackingArea
      .on('mouseenter', () => {
        vis.tooltip.style('display', 'block');
      })
      .on('mouseleave', () => {
        vis.tooltip.style('display', 'none');
      })
      .on('mousemove', function(event) {
        // Get date that corresponds to current mouse x-coordinate
        const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
        const date = vis.xScale.invert(xPos);
        const dataArray = [];
        for (const entry of vis.data) {
          dataArray.push(entry);
        }

        // Find nearest data point
        const index = vis.bisectDate(dataArray, date, 1);
        const a = dataArray[index - 1];
        const b = dataArray[index];
        const d = b && (date - a[0] > b[0] - date) ? b : a; 
        


        // Update tooltip
        vis.tooltip.select('circle')
            .attr('transform', `translate(${vis.xScale(vis.xValue(d))},${vis.yScale(d[1])})`);
        
        vis.tooltip.select('text')
            .attr('transform', `translate(${vis.xScale(vis.xValue(d))},${(vis.yScale(d[1]) - 15)})`)
            .text(Math.round(d[1]));
      });

    vis.marks.transition()
    .duration(2000)
    .attr("d", d3.line()
      .x(d => vis.xScale(vis.xValue(d)))
      .y(d => vis.yScale(vis.yValue(d))))
      .attr("fill", "none")
      .attr("stroke", "#525252")
      .attr("stroke-width", 2)
    
    // Update the axes
    vis.xAxisG.transition()
    .duration(2000)
    .call(vis.xAxis);
    vis.yAxisG.transition()
    .duration(2000)
    .call(vis.yAxis);
  }
}