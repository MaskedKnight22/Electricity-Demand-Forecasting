document.getElementById("ForButton").style.color = "#ffe03f";

let Forcount = 1;

let Actcount = 1;

let forrow = onloadfor();

let actrow = onloadact();

var forheaders = ["Time","Temperature (C)","Pressure_kpa","Cloud Cover (%)","Wind Direction (deg)","Wind Speed (kmh)"];

var actheaders = ["Time","Load (kW)","Pressure_kpa","Cloud Cover (%)","Humidity (%)","Temperature (C)","Wind Direction (deg)","Wind Speed (kmh)"];

async function onloadfor() {

  const apiUrl = "https://ob3892ocba.execute-api.ap-southeast-2.amazonaws.com/file-get-s3/electricitydemandforecasting/Data/forcasts.csv";
  
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

        var table = document.getElementById("display_forcsv_data");
          var headers = forheaders;
          var htmlHeader = '<thead><tr>';
          for (var i = 0; i < headers.length; i++) {
            htmlHeader += '<th>' + headers[i] + '</th>';
          }
            htmlHeader += '<tr></thead>';
            var htmlBody = '<tbody>';

            for (var i = rows.length - 1; rows.length - 25; i--) {
            var cells = rows[i].split(",");
            htmlBody += '<tr>';
            for (var j = 0; j < cells.length; j++) {
              htmlBody += '<td>' + cellContent + '</td>';
            }
            htmlBody += '</tr>';

            }
            htmlBody += '</tbody>';   
            table.innerHTML = htmlHeader + htmlBody;
    return rows;
  } catch (error) {
    return "Error: " + error.message;
  }

};

async function onloadact() {
    
    const apiUrl = "https://ob3892ocba.execute-api.ap-southeast-2.amazonaws.com/file-get-s3/electricitydemandforecasting/Data/actuals.csv";
  
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
      return rows;
    } catch (error) {
      return "Error: " + error.message;
    }

}

  document.getElementById("ForButtonHis").onclick = async function () {

    document.getElementById("ForButton").style.color = "#ffe03f";
  
    document.getElementById("ActButton").style.color = "#ffffff";
  
    document.getElementById("ForForm").style.display = 'block';
  
    document.getElementById("ActForm").style.display = 'none';

    document.getElementById("display_forcsv_data").style.display = 'none';

  
  };

  document.getElementById("ActButtonHis").onclick = async function () {
  
    document.getElementById("ForButton").style.color = "#ffffff";
  
    document.getElementById("ActButton").style.color = "#ffe03f";
  
    document.getElementById("ForForm").style.display = 'none';
  
    document.getElementById("ActForm").style.display = 'block';

  
  };


 document.getElementById("ForButtonL").onclick = async function () {
  Forcount = Forcount -1
   For (var i = 0; i < jsonData.length; i++){

   }

 };

 document.getElementById("ForButtonR").onclick = async function () {
  Forcount = Forcount +1
   
 };











