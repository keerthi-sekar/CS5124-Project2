
let data, barchartA, barchartB, linechartA;

processedData = []
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

        let parsed1 = d.SERVICE_CODE.replace('"/','');
        let parsed2 = parsed1.replace('\"','');
        let parsed_finalServiceCode = parsed2.replace('"', '');

        var req_date = {
          'Service_ID': d.SERVICE_REQUEST_ID,
          'Status': d.STATUS,
          'ServiceCode': parsed_finalServiceCode,
          'DATETIME': d.REQUESTED_DATETIME,
          'RequestedYear': d.REQUESTED_DATETIME.substring(0,4),
          'UpdatedYear': d.UPDATED_DATETIME.substring(0,4),
          'RequestedMonth': d.REQUESTED_DATETIME.substring(5,7),
          'UpdatedMonth': d.UPDATED_DATETIME.substring(5,7),
          'RequestedDay': d.REQUESTED_DATETIME.substring(8,10),
          'UpdatedDay': d.UPDATED_DATETIME.substring(8,10),
          'Zipcode': d.ZIPCODE,
          'Agency': d.AGENCY_RESPONSIBLE
        }
        requestedDates.push(req_date);
      }

    });

    
    console.log('req-date', data);
    requested_fulldate = d3.rollups(requestedDates, v => v.length, d => d.DATETIME);
    requested_month = d3.rollups(requestedDates, v => v.length, d => d.RequestedMonth);
    requested_day = d3.rollups(requestedDates, v => v.length, d => d.RequestedDay);
    service_code_group = d3.rollups(requestedDates, v => v.length, d => d.ServiceCode);
    status_rollup = d3.rollups(requestedDates, v => v.length, d => d.Status);
    zipcode_rollup = d3.rollups(requestedDates, v => v.length, d => d.Zipcode);
    agency_rollup = d3.rollups(requestedDates, v => v.length, d => d.Agency);

    console.log(requested_fulldate);

    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#my-map'}, processedData);

    barchartA = new Barchart({
      parentElement: '#barchartA',
      xAxisTitle: 'Time'
      }, data, requested_month);
    
    barchartA.updateVis();

    barchartB = new Barchart({
      parentElement: '#barchartB',
      xAxisTitle: 'Service Code'
      }, data, service_code_group);
    
    barchartB.updateVis();

    requested_fulldate.sort(function(a,b){
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b[0]) - new Date(a[0]);
    });
    console.log(requested_fulldate);
    linechartA = new LineChart({
      parentElement: '#linechartA'
    }, requested_fulldate)
    linechartA.updateVis();
 
  })
  .catch(error => console.error(error));


  d3.select("#selectGraph").on("change", function(d) {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value")
    
    if(selectedOption == 'sc')
    {
      barchartB.num_map = service_code_group;
      barchartB.xAxisTitle = 'Service Code';
    }
    else if(selectedOption == 'agency')
    {
      barchartB.num_map = agency_rollup;
      barchartB.xAxisTitle = 'Agency';
    }
    else
    {
      barchartB.num_map = status_rollup;
      barchartB.xAxisTitle = 'Status';
    }

    barchartB.updateVis();
  })

  d3.select("#timeGraph").on("change", function(d) {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value")
    
    if(selectedOption == 'month')
    {
      barchartA.num_map = requested_month;
      
    }
    else
    {
      barchartA.num_map = requested_day;
    }

    barchartA.updateVis();
})
