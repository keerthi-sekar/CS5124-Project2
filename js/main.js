let data, barchartA, barchartB, barchartC, linechartA, leafletMap, dayRollupG;
let selectedOption = 'sc'
let latLongArea = [];
let filter = [];
let filter2 = [];
var currentData;
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

        const date1 = new Date(d.REQUESTED_DATETIME)
        const date2 = new Date(d.UPDATED_DATETIME)
        // To calculate the time difference of two dates
        var Difference_In_Time = date2.getTime() - date1.getTime();
        // To calculate the no. of days between two dates
        var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
        // console.log(Difference_In_Days)
        d.RESPONSE_TIME = Difference_In_Days

        let dayOfWeek = date1.getDay();

        var req_date = {
          'Service_ID': d.SERVICE_REQUEST_ID,
          'Status': d.STATUS,
          'ServiceCode': parsed_finalServiceCode,
          'DATETIME': d.REQUESTED_DATETIME,
          'RequestedYear': d.REQUESTED_DATETIME.substring(0,4),
          //'UpdatedYear': d.UPDATED_DATETIME.substring(0,4),
          'RequestedMonth': d.REQUESTED_DATETIME.substring(5,7),
          //'UpdatedMonth': d.UPDATED_DATETIME.substring(5,7),
          'RequestedDay': d.REQUESTED_DATETIME.substring(8,10),
          //'UpdatedDay': d.UPDATED_DATETIME.substring(8,10),
          'Zipcode': d.ZIPCODE,
          'Agency': d.AGENCY_RESPONSIBLE,
          'ReponseTime': d.RESPONSE_TIME,
          'DayOfWeek': dayOfWeek+1
        }
        requestedDates.push(req_date);
      }

    });

    currentData = [...processedData];

    console.log('req-date', requestedDates);

    requestedDates = requestedDates.sort(function (a,b) {return d3.ascending(a.DayOfWeek, b.DayOfWeek);});
    requestedDates = requestedDates.sort(function (a,b) {return d3.ascending(a.ReponseTime, b.ReponseTime);});

    requested_fulldate = d3.rollups(requestedDates, v => v.length, d => d.DATETIME);
    requested_month = d3.rollups(requestedDates, v => v.length, d => d.RequestedMonth);
    requested_day = d3.rollups(requestedDates, v => v.length, d => d.RequestedDay);
    service_code_group = d3.rollups(requestedDates, v => v.length, d => d.ServiceCode);
    status_rollup = d3.rollups(requestedDates, v => v.length, d => d.Status);
    zipcode_rollup = d3.rollups(requestedDates, v => v.length, d => d.Zipcode);
    agency_rollup = d3.rollups(requestedDates, v => v.length, d => d.Agency);
    response_time_rollup = d3.rollups(requestedDates, v => v.length, d => d.ReponseTime);
    dayOfWeek_rollup = d3.rollups(requestedDates, v => v.length, d => d.DayOfWeek);
    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#my-map'}, processedData);

    var window_width = window.innerWidth;
    barchartA = new Barchart({
      parentElement: '#barchartA',
      xAxisTitle: 'Month'
      }, data, requested_month, window_width / 2 - 50);
   
    barchartA.updateVis();

    barchartB = new Barchart({
      parentElement: '#barchartB',
      xAxisTitle: 'Service Code'
      }, data, service_code_group, window_width / 2 - 50);
   
    barchartB.updateVis();


    processedData.sort(function(a,b){
      return new Date(a.REQUESTED_DATE) - new Date(b.REQUESTED_DATE);
    });
    dayRollupG = d3.rollups(processedData, v => v.length, d => d.REQUESTED_DATETIME.substring(5,10));
    barchartC = new Barchart({
      parentElement: '#barchartC',
      xAxisTitle: 'Date'
    }, processedData, dayRollupG, window_width - 50);
    barchartC.updateVis();
 
  })
  .catch(error => console.error(error));

  d3.select("#selectGraph").on("change", function(d) {
    // recover the option that has been chosen
    selectedOption = d3.select(this).property("value")

    currentData = currentData.sort(function (a,b) {return d3.ascending(new Date(a.REQUESTED_DATETIME).getDay()+1, new Date(b.REQUESTED_DATETIME).getDay()+1);});
    currentData = currentData.sort(function (a,b) {return d3.ascending(((new Date(a.UPDATED_DATETIME).getTime() - new Date(a.REQUESTED_DATETIME).getTime()) / (1000 * 3600 * 24)),
                                                                       ((new Date(b.UPDATED_DATETIME).getTime() - new Date(b.REQUESTED_DATETIME).getTime()) / (1000 * 3600 * 24)));});
   
    if(selectedOption == 'sc')
    {
      barchartB.num_map = d3.rollups(currentData, v => v.length, d => d.SERVICE_CODE.substring(1,d.SERVICE_CODE.length - 1));
      barchartB.config.xAxisTitle = 'Service Code';
    }
    else if(selectedOption == 'agency')
    {
      barchartB.num_map = d3.rollups(currentData, v => v.length, d => d.AGENCY_RESPONSIBLE);
      barchartB.config.xAxisTitle = 'Agency';
    }
    else if(selectedOption == 'rtime')
    {
      barchartB.num_map = d3.rollups(currentData, v => v.length, d => ((new Date(d.UPDATED_DATETIME).getTime() - new Date(d.REQUESTED_DATETIME).getTime()) / (1000 * 3600 * 24)));
      barchartB.config.xAxisTitle = 'Difference in Days';
    }
    else if(selectedOption == 'day')
    {
      barchartB.num_map = d3.rollups(currentData, v => v.length, d => new Date(d.REQUESTED_DATETIME).getDay()+1);
      barchartB.config.xAxisTitle = 'Day of the week';
    }
    else if(selectedOption == 'zipcode')
    {
      barchartB.num_map = d3.rollups(currentData, v => v.length, d => d.ZIPCODE);
      barchartB.config.xAxisTitle = 'Zipcode';
    }

    barchartB.updateVis();
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
  if (filter.length == 0 && filter2.length == 0 && latLongArea.length == 0) {
    document.getElementById("btn").disabled = true;
    // Reset Data to original
    barchartC.num_map = dayRollupG;
    leafletMap.data = processedData;
    currentData = [...processedData];
   
    if(selectedOption == 'sc')
    {
      barchartB.num_map = service_code_group;
      barchartB.config.xAxisTitle = 'Service Code';
    }
    else if(selectedOption == 'agency')
    {
      barchartB.num_map = agency_rollup;
      barchartB.config.xAxisTitle = 'Agency';
    }
    else if(selectedOption == 'rtime')
    {
      barchartB.num_map = response_time_rollup;
      barchartB.config.xAxisTitle = 'Difference in Days';
    }
    else if(selectedOption == 'day')
    {
      barchartB.num_map = dayOfWeek_rollup;
      barchartB.config.xAxisTitle = 'Day of the week';
    }
    else if(selectedOption == 'zipcode')
    {
      barchartB.num_map = zipcode_rollup;
      barchartB.config.xAxisTitle = 'Zipcode';
    }

    // Added to remove highlight on btn click
    barchartA.updateVis();
  } 
  else if(filter.length == 0 && filter2.length == 0) {
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
    currentData = [...newTempData];
  }
  else {
    document.getElementById("btn").disabled = false;
    // Set Data to only contain what is in filter
    filter.sort();
    var tempData = [];
    filter.forEach(e => {
      var tempData2 = currentData.filter(d => e === d.REQUESTED_DATETIME.substring(5,7));
      tempData2.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a.REQUESTED_DATE) - new Date(b.REQUESTED_DATE);
      });
      tempData = tempData.concat(tempData2)
    });

    currentData = tempData.length > 0 ? [...tempData] : [...currentData]

    filter2.forEach(e => {
      let key = Object.keys(e);
      let val = e[key[0]];
      var tempData2 = key == "Service Code" ? currentData.filter(d => val == d.SERVICE_CODE.substring(1,d.SERVICE_CODE.length - 1)) : 
                      key == "Agency" ? currentData.filter(d => val === d.AGENCY_RESPONSIBLE) :
                      key == "Difference in Days" ? currentData.filter(d => val == ((new Date(d.UPDATED_DATETIME).getTime() - new Date(d.REQUESTED_DATETIME).getTime()) / (1000 * 3600 * 24))) :
                      key == "Day of the week" ? currentData.filter(d => val === new Date(d.REQUESTED_DATETIME).getDay()+1) :
                      currentData.filter(d => val === d.ZIPCODE);

      currentData = [...tempData2]
    });

    console.log(latLongArea)
    if(latLongArea.length > 0) {
      let newTempData = [];
      currentData.filter(function(d) {
        if(d.LATITUDE <= parseFloat(latLongArea[3]) && d.LATITUDE >= parseFloat(latLongArea[1]) && 
           d.LONGITUDE >= parseFloat(latLongArea[0]) && d.LONGITUDE <= parseFloat(latLongArea[2]))
        {
          newTempData.push(d);
        }
      });
      currentData = [...newTempData];
    }

    leafletMap.data = currentData;
    leafletMap.Dots.remove();

    var dayRollup = d3.rollups(currentData, v => v.length, d => d.REQUESTED_DATETIME.substring(5,10));
    barchartC.num_map = dayRollup;
    barchartC.bars.remove();

    if(selectedOption == 'sc')
    {
      barchartB.num_map = d3.rollups(currentData, v => v.length, d => d.SERVICE_CODE.substring(1,d.SERVICE_CODE.length - 1));
      barchartB.config.xAxisTitle = 'Service Code';
    }
    else if(selectedOption == 'agency')
    {
      barchartB.num_map = d3.rollups(currentData, v => v.length, d => d.AGENCY_RESPONSIBLE);
      barchartB.config.xAxisTitle = 'Agency';
    }
    else if(selectedOption == 'rtime')
    {
      barchartB.num_map = d3.rollups(currentData, v => v.length, d => ((new Date(d.UPDATED_DATETIME).getTime() - new Date(d.REQUESTED_DATETIME).getTime()) / (1000 * 3600 * 24)));
      barchartB.config.xAxisTitle = 'Difference in Days';
    }
    else if(selectedOption == 'day')
    {
      barchartB.num_map = d3.rollups(currentData, v => v.length, d => new Date(d.REQUESTED_DATETIME).getDay()+1);
      barchartB.config.xAxisTitle = 'Day of the week';
    }
    else if(selectedOption == 'zipcode')
    {
      barchartB.num_map = d3.rollups(currentData, v => v.length, d => d.ZIPCODE);
      barchartB.config.xAxisTitle = 'Zipcode';
    }
  }
  // Update Chart
  barchartC.updateVis();
  barchartB.updateVis();

  leafletMap.renderVis();
}