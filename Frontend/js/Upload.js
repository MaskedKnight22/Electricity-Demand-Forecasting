let actdate = latestactdate()

let fordate = latestfordate()

let foruploadcheck = 0;

let forlencheck = 1;

let actuploadcheck = 0;

let actlencheck = 1;

let actcsvString = ''

let forcsvString = ''


document.getElementById("ForButton").style.color = "#ffe03f";

var forheaders = ["Time","Cloud Cover (%)","Pressure_kpa","Temperature (C)","Wind Direction (deg)","Wind Speed (kmh)"];

var actheaders = ["Time","Load (kW)","Pressure_kpa","Cloud Cover (%)","Humidity (%)","Temperature (C)","Wind Direction (deg)","Wind Speed (kmh)"];

  document.getElementById("ForButton").onclick = async function () {

    const fileInput = document.getElementById("actfile_upload");
    fileInput.value = ''; 

    document.getElementById("ForButton").style.color = "#ffe03f";
  
    document.getElementById("ActButton").style.color = "#ffffff";
  
    document.getElementById("ForForm").style.display = 'block';
  
    document.getElementById("ActForm").style.display = 'none';

    document.getElementById("display_forcsv_data").style.display = 'none';

    document.getElementById("ForUpload").style.display = 'none';

    document.getElementById("ForReset").style.display = 'none';
  
  };

    document.getElementById("ForTemButton").onclick = async function () {
  
    document.getElementById("ForTemButton").style.color = "#ffffff";

    var fortemtime = await latestfordate()

    fortemtime.setTime(fortemtime.getTime() + 60 * 60 * 1000);
  
    var csv = 'Time,Cloud Cover (%),Pressure_kpa,Temperature (C),Wind Direction (deg),Wind Speed (kmh)\n';
  
    for (var i = 0; i < 24; i++) {
      var year = fortemtime.getFullYear();
      var month = String(fortemtime.getMonth() + 1).padStart(2, '0'); // Add 1 because getMonth() returns 0-indexed month
      var day = String(fortemtime.getDate()).padStart(2, '0');
      var hours = String(fortemtime.getHours()).padStart(2, '0');
      var minutes = String(fortemtime.getMinutes()).padStart(2, '0');
      var seconds = String(fortemtime.getSeconds()).padStart(2, '0');
  
      var fortime = day + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;

      csv += fortime + (i === 23 ? ",0,0,0,0,0" : ",0,0,0,0,0\n")
  
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
    fordate = await latestfordate()
    var forfiles = document.getElementById('forfile_upload').files;
    if (forfiles.length == 0) {
      alert("Please choose a valid csv file");
      return;
    }
    var filename = forfiles[0].name;
    var extension = filename.substring(filename.lastIndexOf(".")).toUpperCase();

    //Checks if a file is a csv and calls csvFileToJSON
    if (extension == '.CSV') {
      csvFileToSTR(forfiles[0]);
      csvFileToJSON(forfiles[0]);
      document.getElementById("display_forcsv_data").style.display = 'block';
      document.getElementById("ForUpload").style.display = 'block';
      document.getElementById("ForReset").style.display = 'block';
    } 
    
    //Tells you wrong file type uploaded
    else {
      alert("Please select a valid csv file.");
    }

    function csvFileToSTR(file) {
      try {
        var reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = function (e) {

          var rows = e.target.result.trim().split("\r\n");

          forcsvString = ''

          for (var i = 1; i < rows.length; i++){
            const rowAdded = rows[i] + (i === rows.length - 1 ? "" : "\n")
            forcsvString += rowAdded

          }
        }
      }
      catch (e) {
        console.error(e);
      }
    };
  
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
                alert("Column headers do not match the expected format. Please download and use the template.");
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
        foruploadcheck = 0;
        forlencheck = 1;
        if (jsonData.length > 0) {
          var headers = forheaders;
          var htmlHeader = '<thead><tr>';
          for (var i = 0; i < headers.length; i++) {
            htmlHeader += '<th>' + headers[i] + '</th>';
          }
          htmlHeader += '<tr></thead>';
          var htmlBody = '<tbody>';
          if (jsonData.length - 1 === 23) {
            forlencheck = 0;
          }
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
                if (cellValue.getTime() !== forcomparetime.getTime() || i > 23) {
                  cellContent = cellValue + ' ❌'; // Display a cross (❌)
                  foruploadcheck = 1;
              }
              else{
                cellContent = cellValue + ' ✅'; // checks if Time is a Date
              }
              }
               else if ((key === "Temperature (C)" || key === "Pressure_kpa") && dataType === "number") {
                cellContent = cellValue + ' ✅'; 
              }

              else if ((key === "Wind Direction (deg)") && dataType === "number" && cellValue <= 360 && cellValue >= 0) {
                cellContent = cellValue + ' ✅'; // checks if Temperature (C) is a number
              }

              else if ((key === "Cloud Cover (%)") && dataType === "number" && cellValue <= 100 && cellValue >= 0) {
                cellContent = cellValue + ' ✅'; // checks if Temperature (C) is a number
              }

              else if ((key === "Wind Speed (kmh)") && dataType === "number" && cellValue >= 0) {
                cellContent = cellValue + ' ✅'; // checks if Temperature (C) is a number
              }
              
               // if the data type doesn't match
               else  {
                cellContent = cellValue + ' ❌'; 
                foruploadcheck = 1;
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
    let temfordate = new Date("2022-03-24 23:00:00")
    temfordate = await latestactdate()
    if (foruploadcheck === 1) {
      alert("There is an error in the data, please fix it and reupload the data.");
      return;
    }
    else if (forlencheck === 1) {
      alert("There isn't 24 hours of data. Please make sure you're uploading a days worth of data.'");
      return;
    }
    else if (temfordate === fordate) {

      pushfordate(forcsvString)
      fordate = await latestfordate()
    }
      else{
      alert("Someone has updated the data already, please look at the history tab or check the data again")
      }
    };
  

  document.getElementById("ForReset").onclick = async function () {

    document.getElementById("display_forcsv_data").style.display = 'none';
    
    document.getElementById("ForUpload").style.display = 'none';

    document.getElementById("ForReset").style.display = 'none';

    const fileInput = document.getElementById("forfile_upload");
    fileInput.value = ''; 

  };

  document.getElementById("ActButton").onclick = async function () {
  
    const fileInput = document.getElementById("forfile_upload");
    fileInput.value = ''; 

    document.getElementById("ForButton").style.color = "#ffffff";
  
    document.getElementById("ActButton").style.color = "#ffe03f";
  
    document.getElementById("ForForm").style.display = 'none';
  
    document.getElementById("ActForm").style.display = 'block';

    document.getElementById("ActUpload").style.display = 'none';

    document.getElementById("ActReset").style.display = 'none';
  
  };

  
  document.getElementById("ActTemButton").onclick = async function () {
  
    document.getElementById("ActTemButton").style.color = "#ffffff";

    var acttemtime = await latestactdate()

    acttemtime.setTime(acttemtime.getTime() + 60 * 60 * 1000);
  
    var csv = 'Time,Load (kW),Pressure_kpa,Cloud Cover (%),Humidity (%),Temperature (C),Wind Direction (deg),Wind Speed (kmh)\n';
  
    for (var i = 0; i < 24; i++) {
      var year = acttemtime.getFullYear();
      var month = String(acttemtime.getMonth() + 1).padStart(2, '0'); // Add 1 because getMonth() returns 0-indexed month
      var day = String(acttemtime.getDate()).padStart(2, '0');
      var hours = String(acttemtime.getHours()).padStart(2, '0');
      var minutes = String(acttemtime.getMinutes()).padStart(2, '0');
      var seconds = String(acttemtime.getSeconds()).padStart(2, '0');
  
      var acttime = day + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
  
      csv += acttime + (i === 23 ? ",0,0,0,0,0,0,0" : ",0,0,0,0,0,0,0\n")
  
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

    actdate = await latestactdate()
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
      csvFileToSTR(actfiles[0]);
      csvFileToJSON(actfiles[0]);
      document.getElementById("display_actcsv_data").style.display = 'block';
      document.getElementById("ActUpload").style.display = 'block';
      document.getElementById("ActReset").style.display = 'block';
    } 
    
    //Tells you wrong file type uploaded
    else {
      alert("Please select a valid csv file.");
    }
  
    function csvFileToSTR(file) {
      try {
        var reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = function (e) {

          var rows = e.target.result.trim().split("\r\n");

          actcsvString = ''

          for (var i = 1; i < rows.length; i++){
            const rowAdded = rows[i] + (i === rows.length - 1 ? "" : "\n")
            actcsvString += rowAdded

          }
        }
      }
      catch (e) {
        console.error(e);
      }
    };

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
                alert("Column headers do not match the expected format. Please download and use the template.");
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
        actuploadcheck = 0;
        actlencheck = 1;
        if (jsonData.length > 0) {
          var headers = actheaders;
          var htmlHeader = '<thead><tr>';
          for (var i = 0; i < headers.length; i++) {
            htmlHeader += '<th>' + headers[i] + '</th>';
          }
          htmlHeader += '<tr></thead>';
          var htmlBody = '<tbody>';
          if (jsonData.length - 1 === 23) {
            actlencheck = 0;
          }
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
                  actuploadcheck = 1;
              }
              else{
                cellContent = cellValue + ' ✅'; // checks if Time is a Date
              }
              }
               else if ((key === "Pressure_kpa" || key === "Temperature (C)") && dataType === "number") {
                cellContent = cellValue + ' ✅'; // checks if Temperature (C) is a number
              }

              else if ((key === "Cloud Cover (%)" || key === "Humidity (%)") && dataType === "number" && cellValue <= 100 && cellValue >= 0) {
                cellContent = cellValue + ' ✅'; // checks if Temperature (C) is a number
              }

              else if ((key === "Wind Direction (deg)") && dataType === "number" && cellValue <= 360 && cellValue >= 0) {
                cellContent = cellValue + ' ✅'; // checks if Temperature (C) is a number
              }

              else if ((key === "Load (kW)" || key === "Wind Speed (kmh)") && dataType === "number" && cellValue >= 0) {
                cellContent = cellValue + ' ✅'; // checks if Temperature (C) is a number
              }
               
               // if the data type doesn't match
               else  {
                cellContent = cellValue + ' ❌'; 
                actuploadcheck = 1;
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
    let temactdate = new Date("2022-03-24 23:00:00")
    temactdate = await latestactdate()
    if (actuploadcheck === 1) {
      alert("There is an error in the data, please fix it and reupload the data.");
      return;
    }
    else if (actlencheck === 1) {
      alert("There isn't 24 hours of data. Please make sure you're uploading a days worth of data.'");
      return;
    }
    else if (temactdate.getTime() === actdate.getTime()) {
      await pushactdate()
      actdate = await latestactdate()
      }
      else{
      alert("Someone has updated the data already, please look at the history tab or check the data again")
      }
    
    


  };

  document.getElementById("ActReset").onclick = async function () {

    document.getElementById("display_actcsv_data").style.display = 'none';
    
    document.getElementById("ActUpload").style.display = 'none';

    document.getElementById("ActReset").style.display = 'none';

    const fileInput = document.getElementById("actfile_upload");
    fileInput.value = ''; 

  };

  document.getElementById('forfile_upload').addEventListener('change', function(e) {
    var fileName = e.target.files[0].name; // get the file name
    var label = this.previousElementSibling; // get the label
    label.textContent = fileName; // set the file name as label text
});

  document.getElementById('actfile_upload').addEventListener('change', function(e) {
    var fileName = e.target.files[0].name; // get the file name
    var label = this.previousElementSibling; // get the label
    label.textContent = fileName; // set the file name as label text
});

async function latestfordate() {

  const apiUrl = "https://ob3892ocba.execute-api.ap-southeast-2.amazonaws.com/file-get-s3/electricitydemandforecasting/Data/forecasts_not_norm.csv";
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      mode: 'cors', // Enable CORS
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} - ${response.statusText}`);
    }

    const data = await response.text();
    //console.log(data)

    //var rows = data.target.result.trim().split("\r\n");
    var rows = data.trim().split("\n")
    var cells = rows[rows.length -1].split(",");
    var cellValue = cells[0].trim();
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
    return parsedDate;
  } catch (error) {
    return "Error: " + error.message;
  }
};

async function latestactdate() {
  
    const apiUrl = "https://ob3892ocba.execute-api.ap-southeast-2.amazonaws.com/file-get-s3/electricitydemandforecasting/Data/actuals_not_norm.csv";
  
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        mode: 'cors', // Enable CORS
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status} - ${response.statusText}`);
      }
  
      const data = await response.text();
      //console.log(data)

      //var rows = data.target.result.trim().split("\r\n");
      var rows = data.trim().split("\n")
      var cells = rows[rows.length -1].split(",");
      var cellValue = cells[0].trim();
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
      return parsedDate;
    } catch (error) {
      return "Error: " + error.message;
    }
};

async function pushfordate() {

  const apiUrl2 = "https://cors-anywhere.herokuapp.com/https://uyugf0njkf.execute-api.ap-southeast-2.amazonaws.com/file-upload-s3/electricitydemandforecasting/Data/csvforupload.csv"; // Using CORS Anywhere as a proxy

  const apiUrl = "https://ob3892ocba.execute-api.ap-southeast-2.amazonaws.com/file-get-s3/electricitydemandforecasting/Data/forcasts_not_norm.csv";
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      mode: 'cors', // Enable CORS
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} - ${response.statusText}`);
    }

    const data = await response.text();
    console.log("test2")
    var data2 = data + actcsvString
    console.log(data2)


  fetch(apiUrl2, {
    method: 'PUT',
    mode: 'cors', // Enable CORS 
    body: data2,
  })
  .then(function(response) {
    if (response.ok) {
      document.getElementById("result").textContent = "CSV file uploaded successfully.";
    } else {
      throw new Error("Failed to upload CSV file: " + response.status + " - " + response.statusText);
    }
  })
  .catch(function(error) {
    document.getElementById("result").textContent = "Error: " + error.message;
  });

} catch (error) {
  return "Error: " + error.message;
}

};


async function pushactdate() {
  const apiUrl2 = "https://cors-anywhere.herokuapp.com/https://uyugf0njkf.execute-api.ap-southeast-2.amazonaws.com/file-upload-s3/electricitydemandforecasting/Data/csvactupload.csv"; // Using CORS Anywhere as a proxy

  const apiUrl = "https://ob3892ocba.execute-api.ap-southeast-2.amazonaws.com/file-get-s3/electricitydemandforecasting/Data/actuals_not_norm.csv";
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      mode: 'cors', // Enable CORS
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} - ${response.statusText}`);
    }

    const data = await response.text();
    console.log("test2")
    var data2 = data + actcsvString
    console.log(data2)


  fetch(apiUrl2, {
    method: 'PUT',
    mode: 'cors', // Enable CORS 
    body: data2,
  })
  .then(function(response) {
    if (response.ok) {
      document.getElementById("result").textContent = "CSV file uploaded successfully.";
    } else {
      throw new Error("Failed to upload CSV file: " + response.status + " - " + response.statusText);
    }
  })
  .catch(function(error) {
    document.getElementById("result").textContent = "Error: " + error.message;
  });

} catch (error) {
  return "Error: " + error.message;
}
  
};
