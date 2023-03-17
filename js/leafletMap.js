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

    //ESRI
    vis.esriUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    vis.esriAttr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

    //this is the base map layer, where we are showing the map background
    vis.base_layer = L.tileLayer(vis.esriUrl, {
      id: 'esri-image',
      attribution: vis.esriAttr,
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

     vis.colorScale = d3.scaleOrdinal().range(d3.schemeCategory10)
     .domain(['"BLD-RES"','"RCYCLNG"', '"PTHOLE"', '"SIDWLKH"', '"TIRES"']);

      //these are the city locations, displayed as a set of dots 
      vis.Dots = vis.svg.selectAll('circle')
      .data(vis.data) 
      .join('circle')
          .attr("fill", d => vis.colorScale(d.SERVICE_CODE)) 
          .attr("stroke", "black")
          //Leaflet has to take control of projecting points. Here we are feeding the latitude and longitude coordinates to
          //leaflet so that it can project them on the coordinates of the view. Notice, we have to reverse lat and lon.
          //Finally, the returned conversion produces an x and y point. We have to select the the desired one using .x or .y
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
          });;

      //handler here for updating the map, as you zoom in and out           
      vis.theMap.on("zoomend", function(){
        vis.updateVis();
      });


  }

  updateVis() {
    let vis = this;

    //redraw based on new zoom- need to recalculate on-screen position
    vis.Dots
      .attr("cx", d => vis.theMap.latLngToLayerPoint([d.LATITUDE,d.LONGITUDE]).x)
      .attr("cy", d => vis.theMap.latLngToLayerPoint([d.LATITUDE,d.LONGITUDE]).y)
      .attr("r", 3) ;

  }


  renderVis() {
    let vis = this;
 
  }
}