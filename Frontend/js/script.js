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
const DATASETS = {
    ACTUALS: 'Frontend/data/Actuals_Feb_01_8AM.csv',
    FORECASTS: 'Frontend/data/Forecasts_Feb_01_8AM.csv'
};

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
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
}



// Load and process the datasets:
Promise.all([
    d3.csv(DATASETS.ACTUALS),
    d3.csv(DATASETS.FORECASTS)
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
            borderColor: COLORS.BORDER,
            backgroundColor: COLORS.ACCENT,
        }, {
            label: 'Forecasted Temperature (C)',
            data: forecasts_processed,
            borderWidth: 1,
            fill: true,
            borderColor: COLORS.BORDER,
            backgroundColor: (context) => {
                if (!context.chart.chartArea) {
                    return;
                }
                const { ctx, data, chartArea: {top, bottom}} = context.chart;
                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                gradientBg.addColorStop(0.7, 'rgb(255, 241, 145)')
                gradientBg.addColorStop(1, 'rgb(255, 224, 63)')
                return gradientBg;
            }
        }]
    };

    const options = {
        scales: {
            x: {
                grid: {
                    color: COLORS.ACCENT,  // color for the vertical grid lines
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: COLORS.ACCENT,  // color for the horizontal grid lines
                }
            }
        },
        plugins: {
            legend: {
                position: 'right',
                align: 'start',
                onHover: (event => {
                    event.chart.canvas.style.cursor = 'pointer';
                }),
                onLeave: (event => {
                    event.chart.canvas.style.cursor = 'default';
                })
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
                            // `• Load: ${load} kW`,
                            `• Temperature: ${temp} °C`,
                            `• Pressure: ${pressure} kPa`,
                            `• Cloud Cover: ${cloudCover} %`,
                            `• Wind Direction: ${windDirection} °`,
                            `• Wind Speed: ${windSpeed} km/h`
                        ];
                    }
                }
            }
        }
    };


    new Chart(document.getElementById('myChart'), {
        type: 'line',
        data: dataset,
        options: options
    });

}).catch(error => {
    console.error("Error loading CSV data:", error);
});