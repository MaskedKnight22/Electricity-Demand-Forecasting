document.getElementById("ForButton").style.color = "#ffe03f";

  document.getElementById("ForButton").onclick = async function () {

    document.getElementById("ForButton").style.color = "#ffe03f";
  
    document.getElementById("ActButton").style.color = "#ffffff";
  
    document.getElementById("ForForm").style.display = 'block';
  
    document.getElementById("ActForm").style.display = 'none';

    document.getElementById("display_forcsv_data").style.display = 'none';

  
  };

  document.getElementById("ActButton").onclick = async function () {
  
    document.getElementById("ForButton").style.color = "#ffffff";
  
    document.getElementById("ActButton").style.color = "#ffe03f";
  
    document.getElementById("ForForm").style.display = 'none';
  
    document.getElementById("ActForm").style.display = 'block';

  
  };
