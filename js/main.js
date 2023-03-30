
let data, barchartA, barchartB, barchartC, linechartA, leafletMap, dayRollupG;
let selectedOption = "month"
let latLongArea = [];
let filter = [];
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

        const date1 = new Date(d.REQUESTED_DATETIME)
        const date2 = new Date(d.UPDATED_DATETIME)
        // To calculate the time difference of two dates
        var Difference_In_Time = date2.getTime() - date1.getTime();
        // To calculate the no. of days between two dates
        var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
        // console.log(Difference_In_Days)
        d.RESPONSE_TIME = Difference_In_Days
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

    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#my-map'}, processedData);

    var window_width = window.innerWidth;
    barchartA = new Barchart({
      parentElement: '#barchartA',
      xAxisTitle: 'Time'
      }, data, requested_month, window_width / 2 - 50);
    
    barchartA.updateVis();

    barchartB = new Barchart({
      parentElement: '#barchartB',
      xAxisTitle: 'Service Code'
      }, data, service_code_group, window_width / 2 - 50);
    
    barchartB.updateVis();


    dayRollupG = d3.rollups(processedData, v => v.length, d => d.REQUESTED_DATETIME.substring(5,10));
    barchartC = new Barchart({
      parentElement: '#barchartC',
      xAxisTitle: 'Flitered Data'
    }, processedData, dayRollupG, window_width - 50);
    barchartC.updateVis();
 
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
    selectedOption = d3.select(this).property("value")
    
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

function aerialClick(cb) {
  if(cb.checked) {
    leafletMap.updateToAerial();
  }
  else {
    leafletMap.updateToBase();
  }
}

function colorChange() {
  document.getElementById("legend").innerHTML = ''; 
  var val = document.getElementById("colorBy").value;
  leafletMap.updateColor(val)
}

function clearFilters() {
  filter = [];
  latLongArea = [];
  filterData();
}

function filterData() {
  if (filter.length == 0 && latLongArea.length == 0) {
    document.getElementById("btn").disabled = true;
    // Reset Data to original
    barchartC.num_map = dayRollupG;
    leafletMap.data = processedData;
  } 
  else if(filter.length == 0) {
    document.getElementById("btn").disabled = false;
    let newTempData = [];
    processedData.filter(function(d) {
      if(d.LATITUDE <= parseFloat(latLongArea[3]) && d.LATITUDE >= parseFloat(latLongArea[1]) && 
         d.LONGITUDE >= parseFloat(latLongArea[0]) && d.LONGITUDE <= parseFloat(latLongArea[2]))
      {
        newTempData.push(d);
      }
    });
    barchartC.num_map = d3.rollups(newTempData, v => v.length, d => d.REQUESTED_DATETIME.substring(5,10));
    leafletMap.data = newTempData;
  }
  else {
    document.getElementById("btn").disabled = false;
    // Set Data to only contain what is in filter
    filter.sort();
    var tempData = [];
    filter.forEach(e => {
      var tempData2 = processedData.filter(d => e === d.REQUESTED_DATETIME.substring(5,7));
      tempData2.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a.REQUESTED_DATE) - new Date(b.REQUESTED_DATE);
      });
      tempData = tempData.concat(tempData2)
    });

    console.log(latLongArea)
    if(latLongArea.length > 0) {
      let newTempData = [];
      tempData.filter(function(d) {
        if(d.LATITUDE <= parseFloat(latLongArea[3]) && d.LATITUDE >= parseFloat(latLongArea[1]) && 
           d.LONGITUDE >= parseFloat(latLongArea[0]) && d.LONGITUDE <= parseFloat(latLongArea[2]))
        {
          newTempData.push(d);
        }
      });
      tempData = newTempData;
    }

    leafletMap.data = tempData;
    leafletMap.Dots.remove();

    var dayRollup = d3.rollups(tempData, v => v.length, d => d.REQUESTED_DATETIME.substring(5,10));
    barchartC.num_map = dayRollup;
    barchartC.bars.remove();
  }
  // Update Chart
  barchartC.updateVis();

  leafletMap.renderVis();
}