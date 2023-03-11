
let data;

processedData = []
d3.tsv('data/Cincy311_2022_final.tsv')
.then(data => {
    data.forEach(d => {
      d.SERVICE_REQUEST_ID = d.SERVICE_REQUEST_ID;
      d.STATUS = d.STATUS;
      d.SERVICE_NAME = d.SERVICE_NAME;
      d.SERVICE_CODE = d.SERVICE_CODE;
     // d.DESCRIPTION = d.DESCRIPTION;
      d.AGENCY_RESPONSIBLE = d.AGENCY_RESPONSIBLE;
      d.REQUESTED_DATETIME = d.REQUESTED_DATETIME;
      d.UPDATED_DATETIME = d.UPDATED_DATETIME;
      d.EXPECTED_DATETIME = d.EXPECTED_DATETIME;
      d.ADDRESS = d.ADDRESS;
      d.ZIPCODE = +d.ZIPCODE;
      d.LATITUDE = +d.LATITUDE; //make sure these are not strings
      d.LONGITUDE = +d.LONGITUDE; //make sure these are not strings
      //d.REQUESTED_DATE = d.REQUESTED_DATE;
      //d.UPDATED_DATE = d.UPDATED_DATE;
      //d.LAST_TABLE_UPDATE = d.LAST_TABLE_UPDATE;
      
      if(d.LATITUDE && d.LONGITUDE) {
        processedData.push(d)
      }
    });

    console.log(data);

    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#my-map'}, processedData);



  })
  .catch(error => console.error(error));
