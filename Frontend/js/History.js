document.getElementById("ForButton").style.color = "#ffe03f";

let Forcount = 1;

let Actcount = 1;

let forrow = onloadfor();

let actrow = onloadact();

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











