class LeafletMap {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
    }
    this.data = _data;
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    //ESRI (Aerial)
    vis.esriUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    vis.esriAttr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

    //Voyager
    vis.voyagerUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    vis.voyagerAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';


    //this is the base map layer, where we are showing the map background
    vis.base_layer = L.tileLayer(vis.voyagerUrl, {
      id: 'esri-image',
      attribution: vis.voyagerAttr,
      ext: 'png'
    });

    vis.aerial_layer = L.tileLayer(vis.esriUrl, {
      id: 'esri-image',
      attribution: vis.voyagerAttr,
      ext: 'png'
    });


    vis.theMap = L.map('my-map', {
      center: [30, 0],
      zoom: 2,
      layers: [vis.base_layer]
    });

    vis.theMap.setView([vis.data[0].LATITUDE, vis.data[0].LONGITUDE], 11)

    //initialize svg for d3 to add to map
    L.svg({clickable:true}).addTo(vis.theMap)// we have to make the svg layer clickable
    vis.overlay = d3.select(vis.theMap.getPanes().overlayPane)
    vis.svg = vis.overlay.select('svg').attr("pointer-events", "auto")

    // Call type
    vis.callType = ['"BLD-RES"','"RCYCLNG"', '"PTHOLE"', '"SIDWLKH"', '"TIRES"']
    vis.callTypeData = [{name: 'Building, residential', SERVICE_CODE: '"BLD-RES"'},{name: 'Recycling', SERVICE_CODE: '"RCYCLNG"'}, 
                        {name: 'Pothole, repair', SERVICE_CODE:'"PTHOLE"'}, {name: 'Sidewalk, repair haz', SERVICE_CODE: '"SIDWLKH"'}, 
                        {name: 'Tires', SERVICE_CODE:'"TIRES"'}]
    // Agency Responsible
    vis.agency = ['Cinc Building Dept', 'Public Services', "City Manager's Office", 'Dept of Trans and Eng']
    vis.agencyData = [{name: 'Cinc Building Dept', SERVICE_CODE: 'Cinc Building Dept'},{name: 'Public Services', SERVICE_CODE: 'Public Services'}, 
                      {name: "City Manager's Office", SERVICE_CODE:"City Manager's Office"}, {name: 'Dept of Trans and Eng', SERVICE_CODE: 'Dept of Trans and Eng'}]
    // Date
    vis.date = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    vis.dateData = [{name: 'January', SERVICE_CODE: '01'},{name: 'February', SERVICE_CODE: '02'},{name: 'March', SERVICE_CODE: '03'},
                    {name: 'April', SERVICE_CODE: '04'},{name: 'May', SERVICE_CODE: '05'},{name: 'June', SERVICE_CODE: '06'},
                    {name: 'July', SERVICE_CODE: '07'},{name: 'August', SERVICE_CODE: '08'},{name: 'September', SERVICE_CODE: '09'},
                    {name: 'October', SERVICE_CODE: '10'},{name: 'November', SERVICE_CODE: '11'},{name: 'December', SERVICE_CODE: '12'}]
    // Response
    vis.res = ['0', '10', '20', '30', '40', '50']
    vis.resData = [{name: '0-9 days', SERVICE_CODE: '0'},{name: '10-19 days', SERVICE_CODE: '10'},{name: "20-29 days", SERVICE_CODE:"20"}, 
                  {name: '30-39 days', SERVICE_CODE: '30'}, {name: '40-49 days', SERVICE_CODE: '40'}, {name: '50-59 days', SERVICE_CODE: '50'}]

    //Initialize legend
    vis.legendItemSize = 12;
    vis.legendSpacing = 8;
    vis.xOffset = 50;
    vis.yOffset = 50;

    vis.renderVis();

    //handler here for updating the map, as you zoom in and out           
    vis.theMap.on("zoomend", function(){
      vis.zoom();
    });

  }

  zoom() {
    let vis = this;

    //redraw based on new zoom- need to recalculate on-screen position
    vis.Dots
      .attr("cx", d => vis.theMap.latLngToLayerPoint([d.LATITUDE,d.LONGITUDE]).x)
      .attr("cy", d => vis.theMap.latLngToLayerPoint([d.LATITUDE,d.LONGITUDE]).y)
      .attr("r", 3);

  }

  updateColor(colorBy) {
    let vis = this;

    // Use logic to get right array
    var domainArr = colorBy === "Call" ? vis.callType : colorBy === "Agency" ? vis.agency : colorBy === "Date" ? vis.date : vis.res;
    var legendData = colorBy === "Call" ? vis.callTypeData : colorBy === "Agency" ? vis.agencyData : colorBy === "Date" ? vis.dateData : vis.resData;

    vis.colorScale = d3.scaleOrdinal().range(d3.schemeCategory10)
    .domain(domainArr);

    //redraw based on new Color
    vis.Dots
      .attr("fill", d => vis.colorScale(colorBy === "Call" ? d.SERVICE_CODE : colorBy === "Agency" ? d.AGENCY_RESPONSIBLE : colorBy === "Date" ? 
                    d.REQUESTED_DATETIME.substring(5,7) : d.RESPONSE_TIME - (d.RESPONSE_TIME % 10))) 
      .attr("stroke", "black")
      .attr("cx", d => vis.theMap.latLngToLayerPoint([d.LATITUDE,d.LONGITUDE]).x)
      .attr("cy", d => vis.theMap.latLngToLayerPoint([d.LATITUDE,d.LONGITUDE]).y)
      .attr("r", 3) ;

      vis.legend = d3
      .select('#legend')
      .append('svg')
            .selectAll('.legendItem')
            .data(legendData);

      //Create legend items
      vis.legend
      .enter()
      .append('rect')
      .attr('class', 'legendItem')
      .attr('width', vis.legendItemSize)
      .attr('height', vis.legendItemSize)
      .style('fill', d => vis.colorScale(d.SERVICE_CODE))
      .attr('transform',
                (d, i) => {
                    var x = vis.xOffset;
                    var y = vis.yOffset + (vis.legendItemSize + vis.legendSpacing) * i;
                    return `translate(${x}, ${y})`;
                });

    //Create legend labels
    vis.legend
      .enter()
      .append('text')
      .attr('x', vis.xOffset + vis.legendItemSize + 5)
      .attr('y', (d, i) => vis.yOffset + (vis.legendItemSize + vis.legendSpacing) * i + 12)
      .text(d => d.name);	

  }

  updateToAerial() {
    let vis = this;
    vis.theMap.removeLayer(vis.base_layer)
    vis.theMap.addLayer(vis.aerial_layer)
  }

  updateToBase() {
    let vis = this;
    vis.theMap.removeLayer(vis.aerial_layer)
    vis.theMap.addLayer(vis.base_layer)
  }


  renderVis() {
    let vis = this;

    //these are the city locations, displayed as a set of dots 
    vis.Dots = vis.svg.selectAll('circle')
    .data(vis.data) 
    .join('circle')
        .attr("cx", d => vis.theMap.latLngToLayerPoint([d.LATITUDE,d.LONGITUDE]).x)
        .attr("cy", d => vis.theMap.latLngToLayerPoint([d.LATITUDE,d.LONGITUDE]).y) 
        .attr("r", 3)
        .on('mouseover', function(event,d) { //function to add mouseover event
          d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
            .duration('150') //how long we are transitioning between the two states (works like keyframes)
            .attr("stroke", "gold")
            .attr("stroke-width", "3px")
            .attr('r', 8) //change radius

          //create a tool tip
          d3.select('#tooltip')
              .style('opacity', 1)
              .style('z-index', 1000000)
                // Format number with million and thousand separator
              .html(`<div class="tooltip-label">Type of Call: ${d.SERVICE_NAME.substring(1,d.SERVICE_NAME.length - 1)}</div>
                    <div class="tooltip-label">Description: ${d.DESCRIPTION.substring(1,d.DESCRIPTION.length - 1)}</div>
                    <div class="tooltip-label">Date of Call: ${d.REQUESTED_DATETIME}</div>
                    <div class="tooltip-label">Date Updated: ${d.UPDATED_DATETIME}</div>
                    <div class="tooltip-label">Agency Responsible: ${d.AGENCY_RESPONSIBLE}</div>`);
        })
        .on('mousemove', (event) => {
          //position the tooltip
          d3.select('#tooltip')
          .style('left', (event.pageX + 10) + 'px')   
            .style('top', (event.pageY + 10) + 'px');
        })  
        .on('mouseleave', function() { //reverse the action based on when we mouse off the the circle
          d3.select(this).transition()
            .duration('150')
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            .attr('r', 3)
          d3.select('#tooltip').style('opacity', 0);//turn off the tooltip
        });
        
        var val = document.getElementById("colorBy").value;
        document.getElementById("legend").innerHTML = ''; 
        vis.updateColor(val)
  }
}