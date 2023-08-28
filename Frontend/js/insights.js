// Function to process the CSV data
function processData(loadedData) {
    if (!loadedData[0].hasOwnProperty("Time")) {
        console.error("Time column is missing from the dataset!");
        return;
    }
    if (!loadedData[0].hasOwnProperty("Load (kW)")) {
        console.error("Load (kW) column is missing from the dataset!");
        return;
    }

    const times = [];
    const loads = [];
    for (let row of loadedData) {
        times.push(row.Time);
        loads.push(parseFloat(row["Load (kW)"]));
    }
    return [times, loads];
}

// Function to initialize the Chart.js chart for electricity load
function initLoadChart(data) {
    const [labels, load] = processData(data);

    // Prepare data for scatter plot
    const scatterData = labels.map((label, index) => {
        return { x: label, y: load[index] };
    });

    new Chart(document.getElementById('loadChart'), {
        type: 'scatter',  // Change type to scatter
        data: {
            datasets: [{
                label: 'Load (kW)',
                data: scatterData,
                borderColor: 'rgba(255, 241, 145, 0.33)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            events: [],  // Disable all chart events
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Load (kW)'
                    }
                }
            }
        }        
    });
}

// Function to initialize the Chart.js boxplot
function initBoxplotChart(loadedData) {
    const hourlyData = {};
    let minValue = Infinity;  // Initialize to a very large value

    for (let row of loadedData) {
        const hour = row.hour;
        const load = parseFloat(row["Load (kW)"]);

        if (load < minValue) {
            minValue = load;  // Update the minimum value if the current load is smaller
        }

        if (!hourlyData[hour]) {
            hourlyData[hour] = [];
        }

        hourlyData[hour].push(load);
    }

    // Round down minValue to the nearest 100,000
    minValue = Math.floor(minValue / 100000) * 100000;

    new Chart(document.getElementById('boxplotChart'), {
        type: 'boxplot',
        data: {
            labels: Object.keys(hourlyData).map(hour => `${hour}:00`),
            datasets: [{
                label: 'Hourly Load (kW)',
                data: Object.values(hourlyData),
                backgroundColor: 'rgba(255, 241, 145, 0.5)',
                borderColor: 'rgba(255, 241, 145, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Hour'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Load (kW)'
                    },
                    min: minValue  // Set the minimum value for the y-axis
                }
            }
        }
    });
}


// Global font settings:
Chart.defaults.font.family = 'Poppins';
Chart.defaults.color = '#80ccff';

// Define datasets URLs
const df_load = 'data/data_for_analysis/df_load.csv';
const df_load_dt = 'data/data_for_analysis/df_load_dt.csv';

// Load and process the datasets
d3.csv(df_load).then(function(loadedData) {
    initLoadChart(loadedData)
}).catch(function(error) {
    console.log("An error occurred while loading the dataset:", error);
});

// Load the dataset for boxplot
d3.csv(df_load_dt).then(function(loadedData) {
    initBoxplotChart(loadedData);
}).catch(function(error) {
    console.log("An error occurred while loading the dataset:", error);
});