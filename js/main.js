
let data, barchartA, barchartB, linechartA, leafletMap;

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
      
      // Filter data by existing lat/long and exp/req daterime fields, year 2022, and service codes BLD-RES, RCYCLNG, PTHOLE, SIDWLKH, TIRES
      var year = d.REQUESTED_DATETIME.substring(0,4);
      if(d.LATITUDE && d.LONGITUDE && d.SERVICE_REQUEST_ID && 
        year == '2022' && d.EXPECTED_DATETIME && d.REQUESTED_DATETIME &&
        (d.SERVICE_CODE == '"BLD-RES"' || d.SERVICE_CODE == '"RCYCLNG"' || 
        d.SERVICE_CODE == '"PTHOLE"' || d.SERVICE_CODE == '"SIDWLKH"' || d.SERVICE_CODE == '"TIRES"')) {
        processedData.push(d)

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

    
    console.log('req-obj', requestedDates);
    requested_year = d3.rollups(requestedDates, v => v.length, d => d.RequestedYear);
    requested_month = d3.rollups(requestedDates, v => v.length, d => d.RequestedMonth);
    console.log('req-year', requested_year);
    console.log('req-month', requested_month);
    
    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#my-map'}, processedData);

    barchartA = new Barchart({
      parentElement: '#barchartA',
      xAxisTitle: 'Year'
      }, data, requested_year);
    
    barchartA.updateVis();
    
    barchartB = new Barchart({
      parentElement: '#barchartB',
      xAxisTitle: 'Month'
      }, data, requested_month);
    
    barchartB.updateVis();

    scatterplot = new Scatterplot({
			parentElement: '#scatterplot'
		}, data);

 
  })
  .catch(error => console.error(error));

function aerialClick(cb) {
    if(cb.checked) {
      leafletMap.updateToAerial();
    }
    else {
      leafletMap.updateToBase();
    }
}

function colorChange() {
  var val = document.getElementById("colorBy").value;
  console.log(val)
}
