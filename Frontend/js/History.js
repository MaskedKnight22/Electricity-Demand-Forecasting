document.getElementById("ForButton").style.color = "#ffe03f";

let Forcount = 1;

let Actcount = 1;

let forrow = onloadfor();

let actrow = onloadact();

async function onloadfor() {

    const apiUrl = "https://9sz3kobq0h.execute-api.ap-southeast-2.amazonaws.com/s3-updated-get/electricitydemandforecasting/Data/actuals_not_norm.csv";

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} - ${response.statusText}`);
    }


    const csvText = await response.text();
    console.log(csvText);

      //var rows = e.target.result.trim().split("\r\n");
      var rows = csvText.target.result.trim().split("\r\n");
        return rows
    }
    catch (e) {
      console.error(e);
    }

};

async function onloadact() {

      const apiUrl = "https://9sz3kobq0h.execute-api.ap-southeast-2.amazonaws.com/s3-updated-get/electricitydemandforecasting/Data/actuals_not_norm.csv";

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} - ${response.statusText}`);
    }


    const csvText = await response.text();
    console.log(csvText);

      //var rows = e.target.result.trim().split("\r\n");
      var rows = csvText.target.result.trim().split("\r\n");
        return rows
    }
    catch (e) {
      console.error(e);
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











