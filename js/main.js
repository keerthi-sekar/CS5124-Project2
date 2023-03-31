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
      if(d.LATITUDE && d.LONGITUDE && d.SERVICE_REQUEST_ID && d.ZIPCODE &&
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
      document.getElementById("zipLink").style.display = "none"
    }
    else if(selectedOption == 'agency')
    {
      barchartB.num_map = d3.rollups(currentData, v => v.length, d => d.AGENCY_RESPONSIBLE);
      barchartB.config.xAxisTitle = 'Agency';
      document.getElementById("zipLink").style.display = "none"
    }
    else if(selectedOption == 'rtime')
    {
      barchartB.num_map = d3.rollups(currentData, v => v.length, d => ((new Date(d.UPDATED_DATETIME).getTime() - new Date(d.REQUESTED_DATETIME).getTime()) / (1000 * 3600 * 24)));
      barchartB.config.xAxisTitle = 'Difference in Days';
      document.getElementById("zipLink").style.display = "none"
    }
    else if(selectedOption == 'day')
    {
      barchartB.num_map = d3.rollups(currentData, v => v.length, d => new Date(d.REQUESTED_DATETIME).getDay()+1);
      barchartB.config.xAxisTitle = 'Day of the week';
      document.getElementById("zipLink").style.display = "none"
    }
    else if(selectedOption == 'zipcode')
    {
      barchartB.num_map = d3.rollups(currentData, v => v.length, d => d.ZIPCODE);
      barchartB.config.xAxisTitle = 'Zipcode';
      document.getElementById("zipLink").style.display = "block"
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
  filter2 = [];
  latLongArea = [];
  filterData();
}

function filterData() {
  if (filter.length == 0 && filter2.length == 0 && latLongArea.length == 0) {
    document.getElementById("btn").disabled = true;
    // Reset Data to original
    barchartC.num_map = dayRollupG;
    leafletMap.data = processedData;
    barchartA.num_map = requested_month;
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

    document.getElementById("filters").innerHTML = `<h3>No filters applied</h3>`

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
    barchartA.num_map = d3.rollups(newTempData, v => v.length, d => d.REQUESTED_DATETIME.substring(5,7));
    barchartA.bars.remove();

    var filterTab = document.getElementById("filters");
    filterTab.innerHTML = '';
    var ul = document.createElement("ul");
    var li = document.createElement("li");
    li.innerHTML = `Map Brush`;
    ul.appendChild(li);
    filterTab.appendChild(ul)

    newTempData = newTempData.sort(function (a,b) {return d3.ascending(new Date(a.REQUESTED_DATETIME).getDay()+1, new Date(b.REQUESTED_DATETIME).getDay()+1);});
    newTempData = newTempData.sort(function (a,b) {return d3.ascending(((new Date(a.UPDATED_DATETIME).getTime() - new Date(a.REQUESTED_DATETIME).getTime()) / (1000 * 3600 * 24)),
                                                                       ((new Date(b.UPDATED_DATETIME).getTime() - new Date(b.REQUESTED_DATETIME).getTime()) / (1000 * 3600 * 24)));});
    if(selectedOption == 'sc')
    {
      barchartB.num_map = d3.rollups(newTempData, v => v.length, d => d.SERVICE_CODE.substring(1,d.SERVICE_CODE.length - 1));
    }
    else if(selectedOption == 'agency')
    {
      barchartB.num_map = d3.rollups(newTempData, v => v.length, d => d.AGENCY_RESPONSIBLE);
    }
    else if(selectedOption == 'rtime')
    {
      barchartB.num_map = d3.rollups(newTempData, v => v.length, d => ((new Date(d.UPDATED_DATETIME).getTime() - new Date(d.REQUESTED_DATETIME).getTime()) / (1000 * 3600 * 24)));
    }
    else if(selectedOption == 'day')
    {
      barchartB.num_map = d3.rollups(newTempData, v => v.length, d => new Date(d.REQUESTED_DATETIME).getDay()+1);
    }
    else if(selectedOption == 'zipcode')
    {
      barchartB.num_map = d3.rollups(newTempData, v => v.length, d => d.ZIPCODE);
    }
    currentData = [...newTempData];
  }
  else {
    document.getElementById("btn").disabled = false;

    var filterTab = document.getElementById("filters");
    filterTab.innerHTML = '';
    var ul = document.createElement("ul");
    filter.forEach(e => {
      var li = document.createElement("li");
      let mon = e === "01" ? "January" : e === "02" ? "Feburary" : e === "03" ? "March" : e === "04" ? "April" : 
                e === "05" ? "May" : e === "06" ? "June" : e === "07" ? "July" : e === "08" ? "August" :
                e === "09" ? "September" : e === "10" ? "October" : e === "11" ? "November" : "December";

      li.innerHTML = `Month: ${mon}`;
      ul.appendChild(li);
    });
    // filterTab.appendChild(ul)

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
    tempData = tempData.length > 0 ? [...tempData] : [...processedData]

    var filter2Data = []
    filter2.forEach(e => {
      let key = Object.keys(e);
      let val = e[key[0]];
      var tempData2 = key == "Service Code" ? tempData.filter(d => val == d.SERVICE_CODE.substring(1,d.SERVICE_CODE.length - 1)) : 
                      key == "Agency" ? tempData.filter(d => val === d.AGENCY_RESPONSIBLE) :
                      key == "Difference in Days" ? tempData.filter(d => val == ((new Date(d.UPDATED_DATETIME).getTime() - new Date(d.REQUESTED_DATETIME).getTime()) / (1000 * 3600 * 24))) :
                      key == "Day of the week" ? tempData.filter(d => val === new Date(d.REQUESTED_DATETIME).getDay()+1) :
                      key == "Zipcode" ? tempData.filter(d => val === d.ZIPCODE) :
                      tempData.filter(d => val === d.REQUESTED_DATETIME.substring(5,10));

      tempData = [...tempData2]

      var tempData3 = key == "Service Code" ? processedData.filter(d => val == d.SERVICE_CODE.substring(1,d.SERVICE_CODE.length - 1)) : 
                      key == "Agency" ? processedData.filter(d => val === d.AGENCY_RESPONSIBLE) :
                      key == "Difference in Days" ? processedData.filter(d => val == ((new Date(d.UPDATED_DATETIME).getTime() - new Date(d.REQUESTED_DATETIME).getTime()) / (1000 * 3600 * 24))) :
                      key == "Day of the week" ? processedData.filter(d => val === new Date(d.REQUESTED_DATETIME).getDay()+1) :
                      key == "Zipcode" ? processedData.filter(d => val === d.ZIPCODE) : filter2Data.length > 0 ? filter2Data : processedData;

      filter2Data = [...tempData3]
    });

    filter2.forEach(e => {
      let key = Object.keys(e);
      let val = e[key[0]];
      var li = document.createElement("li");

      li.innerHTML = `${key}: ${val}`;
      ul.appendChild(li);
    });
    
    if(latLongArea.length > 0) {
      let newTempData = [];
      tempData.filter(function(d) {
        if(d.LATITUDE <= parseFloat(latLongArea[3]) && d.LATITUDE >= parseFloat(latLongArea[1]) && 
           d.LONGITUDE >= parseFloat(latLongArea[0]) && d.LONGITUDE <= parseFloat(latLongArea[2]))
        {
          newTempData.push(d);
        }
      });
      tempData = [...newTempData];
      var li = document.createElement("li");
      li.innerHTML = `Map Brush`;
      ul.appendChild(li);
    }
    filterTab.appendChild(ul)

    leafletMap.data = tempData;
    leafletMap.Dots.remove();

    var dayRollup = d3.rollups(tempData, v => v.length, d => d.REQUESTED_DATETIME.substring(5,10));
    barchartC.num_map = dayRollup;
    barchartC.bars.remove();

    if(filter2.length > 0) {
      var monthRollup = d3.rollups(filter2Data, v => v.length, d => d.REQUESTED_DATETIME.substring(5,7));
      barchartA.num_map = monthRollup;
      barchartA.bars.remove();
    }
    if(filter2.length == 0) {
      barchartA.num_map = requested_month;
      barchartA.bars.remove();
    }

    tempData = tempData.sort(function (a,b) {return d3.ascending(new Date(a.REQUESTED_DATETIME).getDay()+1, new Date(b.REQUESTED_DATETIME).getDay()+1);});
    tempData = tempData.sort(function (a,b) {return d3.ascending(((new Date(a.UPDATED_DATETIME).getTime() - new Date(a.REQUESTED_DATETIME).getTime()) / (1000 * 3600 * 24)),
                                                                       ((new Date(b.UPDATED_DATETIME).getTime() - new Date(b.REQUESTED_DATETIME).getTime()) / (1000 * 3600 * 24)));});
    if(selectedOption == 'sc')
    {
      barchartB.num_map = d3.rollups(tempData, v => v.length, d => d.SERVICE_CODE.substring(1,d.SERVICE_CODE.length - 1));
    }
    else if(selectedOption == 'agency')
    {
      barchartB.num_map = d3.rollups(tempData, v => v.length, d => d.AGENCY_RESPONSIBLE);
    }
    else if(selectedOption == 'rtime')
    {
      barchartB.num_map = d3.rollups(tempData, v => v.length, d => ((new Date(d.UPDATED_DATETIME).getTime() - new Date(d.REQUESTED_DATETIME).getTime()) / (1000 * 3600 * 24)));
    }
    else if(selectedOption == 'day')
    {
      barchartB.num_map = d3.rollups(tempData, v => v.length, d => new Date(d.REQUESTED_DATETIME).getDay()+1);
    }
    else if(selectedOption == 'zipcode')
    {
      barchartB.num_map = d3.rollups(tempData, v => v.length, d => d.ZIPCODE);
    }
    currentData = [...tempData];
  }
  // Update Chart
  barchartC.updateVis();
  barchartB.updateVis();
  barchartA.updateVis();

  leafletMap.renderVis();
}

function openTab(evt, idName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(idName).style.display = "block";
  evt.currentTarget.className += " active";
}