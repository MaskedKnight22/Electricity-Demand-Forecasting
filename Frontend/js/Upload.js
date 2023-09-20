// Global font settings:
Chart.defaults.font.family = 'Poppins';
Chart.defaults.color = 'rgba(50, 128, 144, 1)';

// Constants
const COLORS = {
    BACKGROUND: 'rgba(255, 241, 145, 1)',
    BORDER: 'rgba(50, 128, 144, 1)',
    BORDER_LITE: 'rgba(50, 128, 144, 0.5)',
    ACCENT: 'rgb(135, 210, 215, 0.7)'
};
const DATASETS = {
    LOAD: 'data/data_for_analysis/df_load.csv',
    LOAD_DT: 'data/data_for_analysis/df_load_dt.csv',
    TREND: 'data/data_for_analysis/trend.csv',
    SEASONAL: 'data/data_for_analysis/seasonal.csv',
    RESIDUAL: 'data/data_for_analysis/residual.csv'
};
let maxDate;  // Declare a variable to store the maximum date

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

  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';

  //provide the name for the CSV file to be downloaded  
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


document.getElementById("ForUpload").onclick = async function () {

  var forfiles = document.getElementById('forfile_upload').files;
  if (forfiles.length == 0) {
    alert("Please choose any file...");
    return;
  }
  var filename = forfiles[0].name;
  var extension = filename.substring(filename.lastIndexOf(".")).toUpperCase();
  if (extension == '.CSV') {
    //Here calling another method to read CSV file into json
    csvFileToJSON(forfiles[0]);
    document.getElementById("TabForTemp").style.display = 'block';
  } else {
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
          for (var j = 0; j < cells.length; j++) {
            if (i == 0) {
              var headerName = cells[j].trim();
              headers.push(headerName);
            } else {
              var key = headers[j];
              if (key) {
                rowData[key] = cells[j].trim();
              }
            }
          }
          if (i != 0) {
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
      var headers = Object.keys(jsonData[0]);
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
          htmlBody += '<td>' + row[key] + '</td>';
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

  
  var actfiles = document.getElementById('actfile_upload').files;
  if (actfiles.length == 0) {
    alert("Please choose any file...");
    return;
  }
  var filename = actfiles[0].name;
  var extension = filename.substring(filename.lastIndexOf(".")).toUpperCase();
  if (extension == '.CSV') {
    //Here calling another method to read CSV file into json
    csvFileToJSON(actfiles[0]);
    document.getElementById("TabForTemp").style.display = 'block';
  } else {
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
          for (var j = 0; j < cells.length; j++) {
            if (i == 0) {
              var headerName = cells[j].trim();
              headers.push(headerName);
            } else {
              var key = headers[j];
              if (key) {
                rowData[key] = cells[j].trim();
              }
            }
          }
          if (i != 0) {
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
    var table = document.getElementById("display_actcsv_data");
    if (jsonData.length > 0) {
      var headers = Object.keys(jsonData[0]);
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
          htmlBody += '<td>' + row[key] + '</td>';
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
