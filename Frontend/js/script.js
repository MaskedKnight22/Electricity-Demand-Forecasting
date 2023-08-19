// Function to process the CSV data:
function processData(loadedData) {
    // check if the required columns exist in the loaded data
    if (!loadedData[0].hasOwnProperty("Time")) {
        console.error("Time column is missing from the dataset!");
        return;
    }
    if (!loadedData[0].hasOwnProperty("Temperature (C)")) {
        console.error("Temperature (C) column is missing from the dataset!");
        return;
    }
    const times = [];
    const temps = [];
    // const loads = [];
    const pressures = [];
    const cloudCovers = [];
    const windDirections = [];
    const windSpeeds = [];
    for (let row of loadedData) {
        times.push(row.Time);
        temps.push(row["Temperature (C)"]);
        // loads.push(row["Load (kW)"]);
        pressures.push(row["Pressure_kpa"]);
        cloudCovers.push(row["Cloud Cover (%)"]);
        windDirections.push(row["Wind Direction (deg)"]);
        windSpeeds.push(row["Wind Speed (kmh)"]);
    }
    // return [times, temps, loads, pressures, cloudCovers, windDirections, windSpeeds];
    return [times, temps, pressures, cloudCovers, windDirections, windSpeeds];
}

// Function to limit decimal numbers to a maximum of 3:
function formatNumber(value) {
    const fixed = parseFloat(value).toFixed(3);  // Fix to 3 decimal places first.
    return parseFloat(fixed);  // Convert back to a number to trim unnecessary zeros.
}

// Define datasets URLs:
const actuals = 'data/Actuals_Feb_01_8AM.csv';
const forecasts = 'data/Forecasts_Feb_01_8AM.csv';

// Load and process the datasets:
Promise.all([
    d3.csv(actuals),
    d3.csv(forecasts)
]).then(function([actualsData, forecastsData]) {
    // const [labels, actuals_processed, loads, pressures, cloudCovers, windDirections, windSpeeds] = processData(actualsData);
    const [labels, actuals_processed, pressures, cloudCovers, windDirections, windSpeeds] = processData(actualsData);

    const [, forecasts_processed] = processData(forecastsData);

    const dataset = {
        labels: labels,
        datasets: [{
            label: 'Actual Temperature (C)',
            data: actuals_processed,
            borderWidth: 1,
            borderColor: '#fff191',
            backgroundColor: '#fff191',
        }, {
            label: 'Forecasted Temperature (C)',
            data: forecasts_processed,
            borderWidth: 1,
            fill: true,
            borderColor: '#ffffff',
            backgroundColor: (context) => {
                if (!context.chart.chartArea) {
                    return;
                }
                const { ctx, data, chartArea: {top, bottom}} = context.chart;
                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                gradientBg.addColorStop(0.3, 'rgba(187, 228, 255, 1)')
                gradientBg.addColorStop(1, 'rgba(0, 130, 255, 1)')
                return gradientBg;
            }
        }]
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                position: 'chartArea',
                align: 'start',
                onHover: (event => {
                    event.chart.canvas.style.cursor = 'pointer';
                }),
                onLeave: (event => {
                    event.chart.canvas.style.cursor = 'default';
                }),
                labels: {
                    font: {
                        size: 12
                    },
                    color: 'white'
                }
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        const index = tooltipItem.dataIndex;
                        // const load = formatNumber(loads[index]);
                        const temp = formatNumber(tooltipItem.parsed.y);
                        const pressure = formatNumber(pressures[index]);
                        const cloudCover = formatNumber(cloudCovers[index]);
                        const windDirection = formatNumber(windDirections[index]);
                        const windSpeed = formatNumber(windSpeeds[index]);
                        return [
                            // `Load: ${load} kW`,
                            `Temperature: ${temp} °C`,
                            `Pressure: ${pressure} kPa`,
                            `Cloud Cover: ${cloudCover} %`,
                            `Wind Direction: ${windDirection} °`,
                            `Wind Speed: ${windSpeed} km/h`
                        ];
                    }
                }
            }
        }
    };

    // Global font settings:
    Chart.defaults.font.family = 'Poppins';
    Chart.defaults.color = '#80ccff';

    new Chart(document.getElementById('myChart'), {
        type: 'line',
        data: dataset,
        options: options
    });

}).catch(error => {
    console.error("Error loading CSV data:", error);
});
