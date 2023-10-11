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

// This function will fetch and render the predictions from the Prophet model.
// function fetchProphetData() {
//     fetch('http://127.0.0.1:8000/model_manager/api/get_predictions/prophet/')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log("Fetched Prophet data:", data);
//             const prophetDiv = document.getElementById("prophetData");
//             prophetDiv.innerHTML = JSON.stringify(data);
//         })
//         .catch(error => {
//             console.log('Problem fetching Prophet data:', error.message);
//         });
// }

function fetchLightGBMData(callback) {
    fetch('http://127.0.0.1:8000/model_manager/api/get_predictions/lightgbm/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched LightGBM data:", data);
            
            // Extract the necessary data
            let times = data.forecast.map(entry => entry.Time);
            let actualLoads = data.actuals.map(entry => entry["Load (kW)"]);
            let predictedLoads = data.preds.map(entry => entry.lightgbm_pred);
            let temperatures = data.forecast.map(entry => entry["Temperature (C) "]);
            let windSpeeds = data.forecast.map(entry => entry["Wind Speed (kmh)"]);
            
            // Chart rendering
            var ctx = document.getElementById('myChart').getContext('2d');
            
            var chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: times,
                    datasets: [{
                        label: 'Actual Load (kW)',
                        data: actualLoads,
                        borderColor: 'rgb(255, 99, 132)',
                        fill: false
                    }, {
                        label: 'Predicted Load (LightGBM)',
                        data: predictedLoads,
                        borderColor: 'rgb(75, 192, 192)',
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            type: 'timeseries',
                            time: {
                                parser: 'YYYY-MM-DDTHH:mm:ss',
                                unit: 'hour',
                                displayFormats: {
                                    hour: 'HH:mm'
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                afterTitle: function(context) {
                                    let dataIndex = context[0].dataIndex;
                                    return 'Temperature: ' + temperatures[dataIndex] + ' C' +
                                           '\nWind Speed: ' + windSpeeds[dataIndex] + ' km/h';
                                }
                            }
                        }
                    }
                }
            });
            // If there's a callback, call it
            if (callback) {
                callback();
            }
        })
        .catch(error => {
            console.log('Problem fetching LightGBM data:', error.message);
            // If there's a callback, call it even if there was an error
            if (callback) {
                callback();
            }
        });
}

// Function to produce new predictions and visualize them in chart form
document.getElementById("fetchPredictions").addEventListener("click", function() {
    const buttonElement = document.getElementById("fetchPredictions");

    // Change the text to 'Loading...' when the button is clicked
    buttonElement.textContent = "Loading...";

    // Call the fetchLightGBMData function
    fetchLightGBMData(() => {
        // Change the text back to 'Refresh Chart' after the function completes
        buttonElement.textContent = "Refresh Chart";
    });
});