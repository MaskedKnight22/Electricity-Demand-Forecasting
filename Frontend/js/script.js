// Global font settings:
Chart.defaults.font.family = 'Poppins';
Chart.defaults.color = 'rgba(50, 128, 144, 1)';

// Constants
const COLORS = {
    BACKGROUND: 'rgba(255, 241, 145, 1)',
    BORDER: 'rgba(50, 128, 144, 1)',
    BORDER_LITE: 'rgba(50, 128, 144, 0.5)',
    ACCENT: 'rgb(135, 210, 215, 0.7)',
    YELLOW: 'rgb(255, 224, 63, 1)'
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
                        label: 'Actual Load',
                        data: actualLoads,
                        borderColor: COLORS.YELLOW,
                        fill: false
                    }, {
                        label: 'Predicted Load (LightGBM)',
                        data: predictedLoads,
                        borderColor: COLORS.BORDER,
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
                                tooltipFormat: 'DD/MM/YYYY HH:mm',
                                displayFormats: {
                                    hour: 'DD/MM/YYYY HH:mm'
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                title: function(context) {
                                    const date = new Date(context[0].parsed.x);
                                    return moment(date).format('DD/MM/YYYY HH:mm');
                                },
                                label: function(context) {
                                    const label = context.dataset.label;
                                    return label + ': ' + context.parsed.y;
                                },
                                afterBody: function(context) {
                                    let dataIndex = context[0].dataIndex;
                                    return ['• Temperature: ' + formatNumber(temperatures[dataIndex]),
                                    '• Wind Speed: ' + formatNumber(windSpeeds[dataIndex])];
                                },
                                footer: function() {
                                    return '*Data is normalized between 0 and 1';
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

// Function to limit decimal numbers to a maximum of 3:
function formatNumber(value) {
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
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