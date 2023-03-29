class Barchart {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data, _map, _width) {
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
          .tickSizeOuter(0)
          .tickFormat(function(d){
            if(vis.config.xAxisTitle === "Flitered Data" && vis.num_map.length < 120) {
              return d.substring(3,5)
            }
            else if(vis.config.xAxisTitle === "Flitered Data") {
              return "";
            }
            else if(vis.config.xAxisTitle === "Time" && selectedOption === "month") {
              let mon = d === "01" ? "January" : d === "02" ? "Feburary" : d === "03" ? "March" : d === "04" ? "April" : 
                        d === "05" ? "May" : d === "06" ? "June" : d === "07" ? "July" : d === "08" ? "August" :
                        d === "09" ? "September" : d === "10" ? "October" : d === "11" ? "November" : "December";
              return mon;
            }
            else {
              return d;
            }
          });
  
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
          .attr('y', -20)
          .attr('dy', '.71em')
          .text(vis.config.yAxisTitle);
  
      vis.chart.append('text') //x-axis = radius [dist]
      .attr('class', 'axis-title')
      .attr('y', vis.height + 25)
      .attr('x', vis.width + 5)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      //.text(vis.config.xAxisTitle);

      // Color scale for Star Type
      vis.colorScale = d3.scaleOrdinal().range(d3.schemeSet3)
      .domain(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]);
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

      vis.colorValue = d => d.key.substring(0,2);
  
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
      // var colorScale = vis._width > 800 ?  d => vis.colorScale(vis.colorValue(d)) : "#023020";
      var colorScale = vis.config.xAxisTitle == "Time" && selectedOption == "month" ? d => vis.colorScale(vis.colorValue(d)) : 
                      vis.config.xAxisTitle == "Flitered Data" ? d => vis.colorScale(vis.colorValue(d)) : "#023020";

        // create tooltip element  
        const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("padding", "2px 8px")
        .style("background", "#fff")
        .style("border", "1px solid #ddd")
        .style("width", "100px")
        .style("box-shadow", "2px 2px 3px 0px rgb(92 92 92 / 0.5)")
        .style("font-size", "12px")
        .style("font-weight", "600");
      
      // Add rectangles
      vis.bars = vis.chart.selectAll('.bar')
          .data(vis.aggregatedData, vis.xValue)
        .join('rect')
          .attr('class', d => filter.find(e => e === d.key) && selectedOption == "month" ? 'bar active' : "bar")
          .attr('x', d => vis.xScale(vis.xValue(d)))
          .attr('width', vis.xScale.bandwidth())
          .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
          .attr('y', d => vis.yScale(vis.yValue(d)))
          // .attr('fill', '#023020')
          .style("fill", colorScale)
  
      vis.bars
        .on('mouseover', (event,d) => {
          // d3.select('#bartooltip')
          //   .style('display', 'block')
          //   .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
          //   .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          //   .html(`
            // <div class="tooltip-label">${d.key}</div>
            //   <div class="tooltip-label">Calls: ${d.count}</div>
          //   `);
          tooltip.html(`<div class="tooltip-title">${d.key}</div>
          <div class="tooltip-label">Calls: ${d.count}</div>`).style("visibility", "visible");
        })
        .on("mousemove", function(){
          tooltip
            .style("top", (event.pageY-10)+"px")
            .style("left",(event.pageX+10)+"px");
        })
        .on("mouseout", function() {
          tooltip.html(``).style("visibility", "hidden");
          // d3.select(this).attr("fill", colorScale);
        });
        // .on('mouseleave', () => {
        //   d3.select('#bartooltip').style('display', 'none');
        // });

        vis.bars.on('click', function(event, d) {
          // vis.bars.remove();
          if(vis.config.xAxisTitle == "Time" && selectedOption == "month") {
            tooltip.html(``).style("visibility", "hidden");
            var isActive = false
            isActive = filter.find(e => e === d.key) // Check month is in filter
            if (isActive) {
              d3.select(this).attr("class", "bar");
              // Remove from filter
              filter = filter.filter(f => f !== isActive); // Remove filter
            } else {
              d3.select(this).attr("class", "bar active");
              // Add to filter
              filter.push(d.key)
            }
            filterData(); // Call global function to update scatter plot
          }
        });

      // Update axes
      vis.xAxisG.call(vis.xAxis);
      vis.yAxisG.call(vis.yAxis);
    }
  }