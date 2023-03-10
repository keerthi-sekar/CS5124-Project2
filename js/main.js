processedData = []
d3.tsv('data/Cincy311_2022_final.tsv')
.then(data => {
    data.forEach(d => {
      d.LATITUDE = +d.LATITUDE; //make sure these are not strings
      d.LONGITUDE = +d.LONGITUDE; //make sure these are not strings
      if(d.LATITUDE && d.LONGITUDE) {
        processedData.push(d)
      }
    });

    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#my-map'}, processedData);


  })
  .catch(error => console.error(error));
