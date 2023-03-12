
let data, barchartA;

processedData = []
callDates = []
requestedDates = []
//real tsv = Cincy311_2022_final.tsv
//partial tsv = partial-data.tsv
d3.tsv('data/Cincy311_2022_final.tsv')
.then(data => {
    data.forEach(d => {
      d.SERVICE_REQUEST_ID = d.SERVICE_REQUEST_ID;
      d.STATUS = d.STATUS;
      d.SERVICE_NAME = d.SERVICE_NAME;
      d.SERVICE_CODE = d.SERVICE_CODE;
      d.DESCRIPTION = d.DESCRIPTION;
      d.AGENCY_RESPONSIBLE = d.AGENCY_RESPONSIBLE;
      d.REQUESTED_DATETIME = d.REQUESTED_DATETIME;
      d.UPDATED_DATETIME = d.UPDATED_DATETIME;
      d.EXPECTED_DATETIME = d.EXPECTED_DATETIME;
      d.ADDRESS = d.ADDRESS;
      d.ZIPCODE = +d.ZIPCODE;
      d.LATITUDE = +d.LATITUDE; //make sure these are not strings
      d.LONGITUDE = +d.LONGITUDE; //make sure these are not strings
      d.REQUESTED_DATE = d.REQUESTED_DATE;
      d.UPDATED_DATE = d.UPDATED_DATE;
      d.LAST_TABLE_UPDATE = d.LAST_TABLE_UPDATE;
      
      if(d.LATITUDE && d.LONGITUDE) {
        processedData.push(d)
      }
      var parseTime = d3.timeParse("%Y");
      if(d.EXPECTED_DATETIME && d.REQUESTED_DATETIME && d.UPDATED_DATETIME)
      {
        var obj = {
          'Service_ID': d.SERVICE_REQUEST_ID,
          'Requested_Year': d.REQUESTED_DATETIME.substring(0,4),
          'Updated_Year': d.UPDATED_DATETIME.substring(0,4),
          'Expected_Year': d.EXPECTED_DATETIME.substring(0,4)
        }
        callDates.push(obj);

        var req_date = {
          'Service_ID': d.SERVICE_REQUEST_ID,
          'RequestedYear': d.REQUESTED_DATETIME.substring(0,4),
          'RequestedMonth': d.REQUESTED_DATETIME.substring(5,7),
          'RequestedDay': d.REQUESTED_DATETIME.substring(8,10)
        }
        requestedDates.push(req_date);
      }

    });

    //console.log(data);
    
    console.log('reqobj', requestedDates);
    requested_year = d3.rollups(requestedDates, v => v.length, d => d.RequestedYear);
    requested_month = d3.rollups(requestedDates, v => v.length, d => d.RequestedMonth);
    // Initialize chart and then show it
    //leafletMap = new LeafletMap({ parentElement: '#my-map'}, processedData);
    console.log(requested_year);
    barchartA = new Barchart({
			parentElement: '#barchartA',
			xAxisTitle: 'Date'
		  }, data, requested_year);
		
		barchartA.updateVis();
 
  })
  .catch(error => console.error(error));
