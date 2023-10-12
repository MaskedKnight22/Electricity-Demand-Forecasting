document.getElementById("ForButtonHis").style.color = "#ffe03f";

let Forcount = 1;

let Actcount = 1;

let ForcountMax = 0;

let ActcountMax = 0;

let forrow = null;

let actrow = null;

onloadfor()

onloadact()

console.log(actrow)

var forheaders = ["Time","Temperature (C)","Pressure_kpa","Cloud Cover (%)","Wind Direction (deg)","Wind Speed (kmh)"];

var actheaders = ["Time","Load (kW)","Pressure_kpa","Cloud Cover (%)","Humidity (%)","Temperature (C)","Wind Direction (deg)","Wind Speed (kmh)"];


async function onloadfor() {

  const apiUrl = "https://ob3892ocba.execute-api.ap-southeast-2.amazonaws.com/file-get-s3/electricitydemandforecasting/Data/forecasts.csv";
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      mode: 'cors', // Enable CORS
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} - ${response.statusText}`);
    }

    const data = await response.text();


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

      for (var j = rows.length - 1; j >= Math.max(0, rows.length - 24); j--) {
        var cells = rows[j].split(",");
        htmlBody += '<tr>';
        for (var k = 0; k < cells.length; k++) {
            htmlBody += '<td>' + cells[k] + '</td>';
        }
        htmlBody += '</tr>';
    }
      htmlBody += '</tbody>';   
      table.innerHTML = htmlHeader + htmlBody;


    ForcountMax = Math.floor(rows.length / 24)       
    forrow = rows;
  } catch (error) {
    return "Error: " + error.message;
  }

};

async function onloadact() {
    
  document.getElementById("ForButtonL").style.display = 'none';

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

      //var rows = data.target.result.trim().split("\r\n");
      var rows = data.trim().split("\n")

      var table = document.getElementById("display_actcsv_data");
      var headers = actheaders;
      var htmlHeader = '<thead><tr>';
      for (var i = 0; i < headers.length; i++) {
        htmlHeader += '<th>' + headers[i] + '</th>';
      }
        htmlHeader += '<tr></thead>'; 
        var htmlBody = '<tbody>';
  
        for (var j = rows.length - 1; j >= rows.length - 24; j--) {
          var cells = rows[j].split(",");
          htmlBody += '<tr>';
          for (var k = 0; k < cells.length; k++) {
              htmlBody += '<td>' + cells[k] + '</td>';
          }
          htmlBody += '</tr>';
      }
        htmlBody += '</tbody>';   
        table.innerHTML = htmlHeader + htmlBody;

      ActcountMax = Math.floor(rows.length / 24)
      actrow = rows;
    } catch (error) {
      return "Error: " + error.message;
    }

}

  document.getElementById("ForButtonHis").onclick = async function () {

    document.getElementById("ForButtonHis").style.color = "#ffe03f";
  
    document.getElementById("ActButtonHis").style.color = "#ffffff";
  
    document.getElementById("ForForm").style.display = 'block';
  
    document.getElementById("ActForm").style.display = 'none';

    if (Forcount === 1){
      document.getElementById("ForButtonL").style.display = 'none';
    }

    if (Forcount === ForcountMax){
      document.getElementById("ForButtonR").style.display = 'none';
    }
  
  };

  document.getElementById("ActButtonHis").onclick = async function () {
  
    document.getElementById("ForButtonHis").style.color = "#ffffff";
  
    document.getElementById("ActButtonHis").style.color = "#ffe03f";
  
    document.getElementById("ForForm").style.display = 'none';
  
    document.getElementById("ActForm").style.display = 'block';

    if (Actcount === 1){
      document.getElementById("ActButtonL").style.display = 'none';
    }

    if (Actcount === ActcountMax){
      document.getElementById("ForButtonR").style.display = 'none';
    }
  
  };


 document.getElementById("ForButtonL").onclick = async function () {
  Forcount = Forcount -1

  var table = document.getElementById("display_forcsv_data");
  var headers = forheaders;
  var htmlHeader = '<thead><tr>';
  for (var i = 0; i < headers.length; i++) {
    htmlHeader += '<th>' + headers[i] + '</th>';
  }
    htmlHeader += '<tr></thead>'; 
    var htmlBody = '<tbody>';

    for (var j = forrow.length - 1 - (Forcount-1)*24; j >= forrow.length - 24 - (Forcount-1)*24; j--) {
      var cells = forrow[j].split(",");
      htmlBody += '<tr>';
      for (var k = 0; k < cells.length; k++) {
          htmlBody += '<td>' + cells[k] + '</td>';
      }
      htmlBody += '</tr>';
  }
    htmlBody += '</tbody>';   
    table.innerHTML = htmlHeader + htmlBody;

    document.getElementById("ForButtonR").style.display = 'block';
  if (Forcount === 1){
    document.getElementById("ForButtonL").style.display = 'none';
  }

 };

 document.getElementById("ForButtonR").onclick = async function () {
  Forcount = Forcount +1

  var table = document.getElementById("display_forcsv_data");
  var headers = forheaders;
  var htmlHeader = '<thead><tr>';
  for (var i = 0; i < headers.length; i++) {
    htmlHeader += '<th>' + headers[i] + '</th>';
  }
    htmlHeader += '<tr></thead>'; 
    var htmlBody = '<tbody>';

    for (var j = forrow.length - 1 - (Forcount-1)*24; j >= forrow.length - 24 - (Forcount-1)*24; j--) {
      var cells = forrow[j].split(",");
      htmlBody += '<tr>';
      for (var k = 0; k < cells.length; k++) {
          htmlBody += '<td>' + cells[k] + '</td>';
      }
      htmlBody += '</tr>';
  }
    htmlBody += '</tbody>';   
    table.innerHTML = htmlHeader + htmlBody;

    document.getElementById("ForButtonL").style.display = 'block';
  if (Forcount === ForcountMax){
    document.getElementById("ForButtonR").style.display = 'none';
  }
 };

 document.getElementById("ActButtonL").onclick = async function () {
  Actcount = Actcount -1

  var table = document.getElementById("display_actcsv_data");
  var headers = actheaders;
  var htmlHeader = '<thead><tr>';
  for (var i = 0; i < headers.length; i++) {
    htmlHeader += '<th>' + headers[i] + '</th>';
  }
    htmlHeader += '<tr></thead>'; 
    var htmlBody = '<tbody>';

    for (var j = actrow.length - 1 - (Actcount-1)*24; j >= actrow.length - 24 - (Actcount-1)*24; j--) {
      var cells = actrow[j].split(",");
      htmlBody += '<tr>';
      for (var k = 0; k < cells.length; k++) {
          htmlBody += '<td>' + cells[k] + '</td>';
      }
      htmlBody += '</tr>';
  }
    htmlBody += '</tbody>';   
    table.innerHTML = htmlHeader + htmlBody;

    document.getElementById("ActButtonR").style.display = 'block';
  if (Actcount === 1){
    document.getElementById("ActButtonL").style.display = 'none';
  }

 };

 document.getElementById("ActButtonR").onclick = async function () {
  Actcount = Actcount +1

  var table = document.getElementById("display_actcsv_data");
  var headers = actheaders;
  var htmlHeader = '<thead><tr>';
  for (var i = 0; i < headers.length; i++) {
    htmlHeader += '<th>' + headers[i] + '</th>';
  }
    htmlHeader += '<tr></thead>'; 
    var htmlBody = '<tbody>';

    for (var j = actrow.length - 1 - (Actcount-1)*24; j >= actrow.length - 24 - (Actcount-1)*24; j--) {
      var cells = actrow[j].split(",");
      htmlBody += '<tr>';
      for (var k = 0; k < cells.length; k++) {
          htmlBody += '<td>' + cells[k] + '</td>';
      }
      htmlBody += '</tr>';
  }
    htmlBody += '</tbody>';   
    table.innerHTML = htmlHeader + htmlBody;

    document.getElementById("ActButtonL").style.display = 'block';
  if (Actcount === ActcountMax){
    document.getElementById("ActButtonR").style.display = 'none';
  }
 };
