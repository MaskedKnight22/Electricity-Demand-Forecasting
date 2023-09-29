let actdate = new Date("2022-03-24 23:00:00")

let fordate = new Date("2022-03-24 23:00:00")

let forupload = 0;

let actupload = 0;

var forheaders = ["Time","Temperature (C)","Pressure_kpa","Cloud Cover (%)","Wind Direction (deg)","Wind Speed (kmh)"];

var actheaders = ["Time","Load (kW)","Pressure_kpa","Cloud Cover (%)","Humidity (%)","Temperature (C)","Wind Direction (deg)","Wind Speed (kmh)"];

  document.getElementById("ForButton").onclick = async function () {

    document.getElementById("ForButton").style.color = "#fb8362";
  
    document.getElementById("ActButton").style.color = "#090706";
  
    document.getElementById("ForForm").style.display = 'block';
  
    document.getElementById("ActForm").style.display = 'none';

    document.getElementById("display_forcsv_data").style.display = 'none';
  
  };

    document.getElementById("ForTemButton").onclick = async function () {
  
    document.getElementById("ForTemButton").style.color = "#090706";

    var fortemtime = new Date(fordate.getTime() + 60 * 60 * 1000);
  
    var csv = 'Time,Temperature (C),Pressure_kpa,Cloud Cover (%),Wind Direction (deg),Wind Speed (kmh)\n';
  
    for (var i = 0; i < 24; i++) {
      var year = fortemtime.getFullYear();
      var month = String(fortemtime.getMonth() + 1).padStart(2, '0'); // Add 1 because getMonth() returns 0-indexed month
      var day = String(fortemtime.getDate()).padStart(2, '0');
      var hours = String(fortemtime.getHours()).padStart(2, '0');
      var minutes = String(fortemtime.getMinutes()).padStart(2, '0');
      var seconds = String(fortemtime.getSeconds()).padStart(2, '0');
  
      var fortime = day + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
  
      csv += fortime + ",0,0,0,0,0\n";
  
      // Increment the time by 1 hour for the next row
      fortemtime.setTime(fortemtime.getTime() + 60 * 60 * 1000);
    }
  
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    
    hiddenElement.download = 'Forecast-Upload-Template.csv';
    hiddenElement.click();
  };
  
  document.getElementById("ForCheck").onclick = async function () {
    
    //Checks if a file has been uploaded
    var forfiles = document.getElementById('forfile_upload').files;
    if (forfiles.length == 0) {
      alert("Please choose a valid csv file");
      return;
    }
    var filename = forfiles[0].name;
    var extension = filename.substring(filename.lastIndexOf(".")).toUpperCase();

    //Checks if a file is a csv and calls csvFileToJSON
    if (extension == '.CSV') {
      csvFileToJSON(forfiles[0]);
      document.getElementById("display_forcsv_data").style.display = 'block';
      document.getElementById("ForUpload").style.display = 'block';
      document.getElementById("ForReset").style.display = 'block';
    } 
    
    //Tells you wrong file type uploaded
    else {
      alert("Please select a valid csv file.");
    }
  
    function csvFileToJSON(file) {
      try {
        var reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = function (e) {

          var jsonData = [];
          var headers = []; 
          var rows = e.target.result.trim().split("\r\n");

          for (var i = 0; i < rows.length; i++) {
            var cells = rows[i].split(",");
            var rowData = {};
            
            if (i === 0) {
              // Convert the header row cells to lowercase for comparison
              var forheaderlower = cells.map(function (cell) {
                return cell.trim().toLowerCase();
              });
    
              // Validate the header order (case-insensitive)
              var forwrongheader = false;
              for (var j = 0; j < forheaders.length; j++) {
                if (forheaderlower[j] !== forheaders[j].toLowerCase()) {
                  forwrongheader = true;
                  break;
                }
              }
    
              // If header doesn't match exit function
              if (forwrongheader) {
                console.error("Column headers do not match the expected format. Please download and use the template.");
                return;
              }
    
              // If header matches, add to headers variable
              headers = cells.map(function (cell) {
                return cell.trim();
              });
            } 

            else {
              for (var j = 0; j < cells.length; j++) {
                var key = headers[j];
                if (key) {
                  var cellValue = cells[j].trim();

                  // Convert specific columns to their desired data types
                  if (key === "Time") {
                    // Parse the date string manually
                    var dateParts = cellValue.split(" ");
                    var datePart = dateParts[0].split("/");
                    var timePart = dateParts[1].split(":");
                    var parsedDate = new Date(
                      parseInt(datePart[2]),  // year
                      parseInt(datePart[1]) - 1,  // month (JavaScript months are 0-based)
                      parseInt(datePart[0]),  // day
                      parseInt(timePart[0]),  // hour
                      parseInt(timePart[1])   // minute
                    );

      
                    // Check if parsing was successful and it's a valid Date object
                    if (!isNaN(parsedDate.getTime())) {
                      rowData[key] = parsedDate;
                    } else {
                      rowData[key] = cellValue
                    }
                  }
                  else if (key === "Temperature (C)" || key === "Pressure_kpa" || key === "Cloud Cover (%)" || key === "Wind Direction (deg)" || key === "Wind Speed (kmh)") {
                    // Attempt to parse these columns as numbers
                    rowData[key] = parseFloat(cellValue);
                  } 
                  else {
                    // For other columns, store the raw value
                    rowData[key] = cellValue;
                  }
                }
              }
              jsonData.push(rowData);
            }
          }
          // Sort the JSON data by the "Time" field in ascending order
          jsonData.sort(function (a, b) {
            return a.Time - b.Time;
          });

          //displaying the json result into HTML table
          displayJsonToHtmlTable(jsonData);
        };
      } 
      catch (e) {
        console.error(e);
      }
    }
  
    function displayJsonToHtmlTable(jsonData) {
        var table = document.getElementById("display_forcsv_data");
        var forcomparetime = new Date(fordate);
        forupload = 0;
        if (jsonData.length > 0) {
          var headers = forheaders;
          var htmlHeader = '<thead><tr>';
          for (var i = 0; i < headers.length; i++) {
            htmlHeader += '<th>' + headers[i] + '</th>';
          }
          htmlHeader += '<tr></thead>';
          var htmlBody = '<tbody>';
          for (var i = 0; i < jsonData.length; i++) {
            var row = jsonData[i];
            forcomparetime.setTime(forcomparetime.getTime() + 60 * 60 * 1000);
            htmlBody += '<tr>';
            for (var j = 0; j < headers.length; j++) {
              var key = headers[j];
              var cellValue = row[key];
              var dataType = typeof cellValue;
              var cellContent = cellValue;

              // Checks if the data type matches the required format
              if (key === "Time" && cellValue instanceof Date && !isNaN(cellValue.getTime())) {
                console.log(cellValue)
                console.log(forcomparetime)
                if (cellValue.getTime() !== forcomparetime.getTime() || i > 23) {
                  cellContent = cellValue + ' ❌'; // Display a cross (❌)
                  forupload = 1;
              }
              else{
                cellContent = cellValue + ' ✅'; // checks if Time is a Date
              }
              }
               else if ((key === "Temperature (C)" || key === "Pressure_kpa" || key === "Cloud Cover (%)" || key === "Wind Direction (deg)" || key === "Wind Speed (kmh)") && dataType === "number") {
                cellContent = cellValue + ' ✅'; 
              }
               // if the data type doesn't match
               else  {
                cellContent = cellValue + ' ❌'; 
                forupload = 1;
              }
              
              htmlBody += '<td>' + cellContent + '</td>';
            }
            htmlBody += '</tr>';
          }
          htmlBody += '</tbody>';
          table.innerHTML = htmlHeader + htmlBody;
        } else {
          table.innerHTML = 'There is no data in CSV';
        }
      }

  };

  document.getElementById("ForUpload").onclick = async function () {


  };

  document.getElementById("ForReset").onclick = async function () {

    document.getElementById("display_forcsv_data").style.display = 'none';
    
    document.getElementById("ForUpload").style.display = 'none';

    document.getElementById("ForReset").style.display = 'none';

  };

  document.getElementById("ActButton").onclick = async function () {
  
    document.getElementById("ForButton").style.color = "#090706";
  
    document.getElementById("ActButton").style.color = "#fb8362";
  
    document.getElementById("ForForm").style.display = 'none';
  
    document.getElementById("ActForm").style.display = 'block';

    document.getElementById("ActUpload").style.display = 'none';

    document.getElementById("ActReset").style.display = 'none';
  
  };

  
  document.getElementById("ActTemButton").onclick = async function () {
  
    document.getElementById("ActTemButton").style.color = "#090706";

    var acttemtime = new Date(actdate.getTime() + 60 * 60 * 1000);
  
    var csv = 'Time,Load (kW),Pressure_kpa,Cloud Cover (%),Humidity (%),Temperature (C),Wind Direction (deg),Wind Speed (kmh)\n';
  
    for (var i = 0; i < 24; i++) {
      var year = acttemtime.getFullYear();
      var month = String(acttemtime.getMonth() + 1).padStart(2, '0'); // Add 1 because getMonth() returns 0-indexed month
      var day = String(acttemtime.getDate()).padStart(2, '0');
      var hours = String(acttemtime.getHours()).padStart(2, '0');
      var minutes = String(acttemtime.getMinutes()).padStart(2, '0');
      var seconds = String(acttemtime.getSeconds()).padStart(2, '0');
  
      var acttime = day + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
  
      csv += acttime + ",0,0,0,0,0,0,0\n";
  
      // Increment the time by 1 hour for the next row
      acttemtime.setTime(acttemtime.getTime() + 60 * 60 * 1000);
    }

    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
  
    //provide the name for the CSV file to be downloaded  
    hiddenElement.download = 'Actual-Upload-Template.csv';
    hiddenElement.click();
  
  };
  
  
  document.getElementById("ActCheck").onclick = async function () {
    
    //Checks if a file has been uploaded
    var actfiles = document.getElementById('actfile_upload').files;
    if (actfiles.length == 0) {
      alert("Please choose a valid csv file");
      return;
    }
    var filename = actfiles[0].name;
    var extension = filename.substring(filename.lastIndexOf(".")).toUpperCase();

    //Checks if a file is a csv and calls csvFileToJSON
    if (extension == '.CSV') {
      csvFileToJSON(actfiles[0]);
      document.getElementById("display_actcsv_data").style.display = 'block';
      document.getElementById("ActUpload").style.display = 'block';
      document.getElementById("ActReset").style.display = 'block';
    } 
    
    //Tells you wrong file type uploaded
    else {
      alert("Please select a valid csv file.");
    }
  
    function csvFileToJSON(file) {
      try {
        var reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = function (e) {

          var jsonData = [];
          var headers = []; 
          var rows = e.target.result.trim().split("\r\n");

          for (var i = 0; i < rows.length; i++) {
            var cells = rows[i].split(",");
            var rowData = {};
            
            if (i === 0) {
              // Convert the header row cells to lowercase for comparison
              var actheaderlower = cells.map(function (cell) {
                return cell.trim().toLowerCase();
              });
    
              // Validate the header order (case-insensitive)
              var actwrongheader = false;
              for (var j = 0; j < actheaders.length; j++) {
                if (actheaderlower[j] !== actheaders[j].toLowerCase()) {
                  actwrongheader = true;
                  break;
                }
              }
    
              // If header doesn't match exit function
              if (actwrongheader) {
                console.error(actheaderlower[j] + "t" + actheaders[j] + "Column headers do not match the expected format. Please download and use the template.");
                return;
              }
    
              // If header matches, add to headers variable
              headers = cells.map(function (cell) {
                return cell.trim();
              });
            } 

            else {
              for (var j = 0; j < cells.length; j++) {
                var key = headers[j];
                if (key) {
                  var cellValue = cells[j].trim();

                  // Convert specific columns to their desired data types
                  if (key === "Time") {

                    // Parse the date string manually
                    var dateParts = cellValue.split(" ");
                    var datePart = dateParts[0].split("/");
                    var timePart = dateParts[1].split(":");
                    var parsedDate = new Date(
                      parseInt(datePart[2]),  // year
                      parseInt(datePart[1]) - 1,  // month (JavaScript months are 0-based)
                      parseInt(datePart[0]),  // day
                      parseInt(timePart[0]),  // hour
                      parseInt(timePart[1])   // minute
                    );
      
                    // Check if parsing was successful and it's a valid Date object
                    if (!isNaN(parsedDate.getTime())) {
                      rowData[key] = parsedDate;
                    } else {
                      rowData[key] = cellValue
                    }
                  }
                  else if (key === "Load (kW)" || key === "Pressure_kpa" || key === "Cloud Cover (%)" || key === "Humidity (%)" || key === "Temperature (C)" || key === "Wind Direction (deg)" || key === "Wind Speed (kmh)") {
                    // Attempt to parse these columns as numbers
                    rowData[key] = parseFloat(cellValue);
                  } 
                  else {
                    // For other columns, store the raw value
                    rowData[key] = cellValue;
                  }
                }
              }
              jsonData.push(rowData);
            }
          }
          // Sort the JSON data by the "Time" field in ascending order
          jsonData.sort(function (a, b) {
            return a.Time - b.Time;
          });

          //displaying the json result into HTML table
          displayJsonToHtmlTable(jsonData);
        };
      } 
      catch (e) {
        console.error(e);
      }
    }
  
    function displayJsonToHtmlTable(jsonData) {
        var table = document.getElementById("display_actcsv_data");
        var actcomparetime = new Date(actdate);
        actupload = 0;
        if (jsonData.length > 0) {
          var headers = actheaders;
          var htmlHeader = '<thead><tr>';
          for (var i = 0; i < headers.length; i++) {
            htmlHeader += '<th>' + headers[i] + '</th>';
          }
          htmlHeader += '<tr></thead>';
          var htmlBody = '<tbody>';
          for (var i = 0; i < jsonData.length; i++) {
            var row = jsonData[i];
            actcomparetime.setTime(actcomparetime.getTime() + 60 * 60 * 1000);
            htmlBody += '<tr>';
            for (var j = 0; j < headers.length; j++) {
              var key = headers[j];
              var cellValue = row[key];
              var dataType = typeof cellValue;
              var cellContent = cellValue;
              
              // Checks if the data type matches the required format
              if (key === "Time" && cellValue instanceof Date && !isNaN(cellValue.getTime())) {
                if (cellValue.getTime() !== actcomparetime.getTime() || i > 23) {
                  cellContent = cellValue + ' ❌'; // Display a cross (❌)
                  actupload = 1;
              }
              else{
                cellContent = cellValue + ' ✅'; // checks if Time is a Date
              }
              }
               else if ((key === "Load (kW)" || key === "Pressure_kpa" || key === "Cloud Cover (%)" || key === "Humidity (%)" || key === "Temperature (C)" || key === "Wind Direction (deg)" || key === "Wind Speed (kmh)") && dataType === "number") {
                cellContent = cellValue + ' ✅'; // checks if Temperature (C) is a number
              }
               
               // if the data type doesn't match
               else  {
                cellContent = cellValue + ' ❌'; 
                actupload = 1;
              }
              
              htmlBody += '<td>' + cellContent + '</td>';
            }
            htmlBody += '</tr>';
          }
          htmlBody += '</tbody>';
          table.innerHTML = htmlHeader + htmlBody;
        } else {
          table.innerHTML = 'There is no data in CSV';
        }
      }

  };

  document.getElementById("ActUpload").onclick = async function () {


  };

  document.getElementById("ActReset").onclick = async function () {

    document.getElementById("display_actcsv_data").style.display = 'none';
    
    document.getElementById("ActUpload").style.display = 'none';

    document.getElementById("ActReset").style.display = 'none';

  };
