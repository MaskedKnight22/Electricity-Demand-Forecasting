let actdate = new Date("2022-03-25 00:00:00")

let fordate = new Date("2022-03-25 00:00:00")

let forupload = 0;

let actupload = 0;

var forheaders = ["Time","Temperature (C)","Pressure_kpa","Cloud Cover (%)","Wind Direction (deg)","Wind Speed (kmh)"];

var actheaders = ["Time","Temperature (C)","Pressure_kpa","Cloud Cover (%)","Wind Direction (deg)","Wind Speed (kmh)"];

document.getElementById("ForButton").onclick = async function () {

    document.getElementById("ForButton").style.color = "#fb8362";
  
    document.getElementById("ActButton").style.color = "#090706";
  
    document.getElementById("ForForm").style.display = 'block';
  
    document.getElementById("ActForm").style.display = 'none';
  
  };
  
  document.getElementById("ActButton").onclick = async function () {
  
    document.getElementById("ForButton").style.color = "#090706";
  
    document.getElementById("ActButton").style.color = "#fb8362";
  
    document.getElementById("ForForm").style.display = 'none';
  
    document.getElementById("ActForm").style.display = 'block';
  
  };
  
  document.getElementById("ForTemButton").onclick = async function () {
  
    document.getElementById("ForTemButton").style.color = "#090706";
  
    var csv = 'Time,Temperature (C),Pressure_kpa,Cloud Cover (%),Wind Direction (deg),Wind Speed (kmh)\n';
  
    // Example rows
    csv += '2022-03-25 01:00:00,0,0,0,0,0\n';
    csv += '2022-03-25 02:00:00,0,0,0,0,0\n';
    csv += '2022-03-25 03:00:00,0,0,0,0,0\n';
  
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    
    hiddenElement.download = 'Forecast-Upload-Template.csv';
    hiddenElement.click();
  };
  
  document.getElementById("ActTemButton").onclick = async function () {
  
    document.getElementById("ForTemButton").style.color = "#090706";
  
    var csv = 'Time,Load (kW),Pressure_kpa,Cloud Cover (%),Humidity (%),Temperature (C),Wind Direction (deg),Wind Speed (kmh)\n';
  
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
  
    //provide the name for the CSV file to be downloaded  
    hiddenElement.download = 'Actual-Upload-Template.csv';
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
          var rows = e.target.result.split("\r\n");

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
                  rowData[key] = cells[j].trim();
                }
              }
              jsonData.push(rowData);
            }
          }

          //displaying the json result into HTML table
          displayJsonToHtmlTable(jsonData);
        }
      } catch (e) {
        console.error(e);
      }
    }
  
    function displayJsonToHtmlTable(jsonData) {
        var table = document.getElementById("display_forcsv_data");
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
            htmlBody += '<tr>';
            for (var j = 0; j < headers.length; j++) {
              var key = headers[j];
              var cellValue = row[key];
              var dataType = typeof cellValue;
              var cellContent = cellValue;
              
              // Checks if the data type matches the required format
              if (key === "Time" && dataType === "Date") {
                cellContent = cellValue + ' ✔️'; // checks if Time is a Date
              }
               else if (key === "Temperature (C)" && dataType === "number") {
                cellContent = cellValue + ' ✔️'; // checks if Temperature (C) is a number
              }
              else if (key === "Pressure_kpa" && dataType === "number") {
                cellContent = cellValue + ' ✔️'; // checks if Pressure_kpa is a number
              }
              else if (key === "Cloud Cover (%)" && dataType === "number") {
                cellContent = cellValue + ' ✔️'; // checks if Cloud Cover (%) is a number
              }
              else if (key === "Wind Direction (deg)" && dataType === "number") {
                cellContent = cellValue + ' ✔️'; // checks if Wind Direction (deg) is a number
              }
              else if (key === "Wind Speed (kmh)" && dataType === "number") {
                cellContent = cellValue + ' ✔️'; // checks if Wind Speed (kmh) is a number
              }
               
               // if the data type doesn't match
               else  {
                cellContent = cellValue + ' ❌'; 
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

      document.getElementById("ForUpload").onclick = async function () {


      };

      document.getElementById("ForReset").onclick = async function () {
        

    };

  };
