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
    LOAD: 'data/data_for_analysis/df_load.csv',
    LOAD_DT: 'data/data_for_analysis/df_load_dt.csv'
};
let maxDate;  // Declare a variable to store the maximum date

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

// Tooltip formatting logic
function formatTooltip(context) {
    const label = context.label || '';
    const raw = context.raw;
    const lines = [`• ${context.dataset.label}: ${label}`];
    if (raw && Array.isArray(raw)) {
        const stats = calculateStats(raw);
        lines.push(`• Min: ${formatNumber(stats.min)} kW`);
        lines.push(`• Q1: ${formatNumber(stats.q1)} kW`);
        lines.push(`• Median: ${formatNumber(stats.median)} kW`);
        lines.push(`• Q3: ${formatNumber(stats.q3)} kW`);
        lines.push(`• Max: ${formatNumber(stats.max)} kW`);
    }
    return lines;
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
                backgroundColor: 'transparent',
                borderColor: COLORS.BORDER_LITE,
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            events: [],  // Disable all chart events
            plugins: {
                legend: {
                    display: false
                },
                annotation: {
                    annotations: {
                        box1: {
                          type: 'box',
                          drawTime: 'beforeDatasetsDraw', // Draw it before drawing the data points
                          xMin: '2020-03-11',
                          xMax: maxDate,
                          backgroundColor: 'rgb(255, 241, 145, 0.5)',
                          borderColor: 'rgb(255, 224, 63)',
                          label: {
                            enabled: true,
                            content: "COVID-19 Era",
                            backgroundColor: 'rgb(255, 241, 145, 0.5)'
                          }
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    title: {
                        display: true,
                        text: 'Time'
                    },
                    grid: {
                        color: COLORS.ACCENT,  // color for the vertical grid lines
                    } 
                },
                y: {
                    title: {
                        display: true,
                        text: 'Load (kW)'
                    },
                    grid: {
                        color: COLORS.ACCENT,  // color for the horizontal grid lines
                    } 
                }
            }
        }        
    });
}

// Generic function to initialize the Chart.js boxplot
function initBoxplotChart(elementId, loadedData, dataLabels, chartTitle, xAxisLabel) {
    const data = {};
    let minValue = Infinity;

    for (let row of loadedData) {
        const labelValue = row[dataLabels];
        const load = parseFloat(row["Load (kW)"]);

        if (load < minValue) {
            minValue = load;
        }

        if (!data[labelValue]) {
            data[labelValue] = [];
        }

        data[labelValue].push(load);
    }

    minValue = Math.floor(minValue / 100000) * 100000;

    new Chart(document.getElementById(elementId), {
        type: 'boxplot',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: chartTitle,
                data: Object.values(data),
                backgroundColor: COLORS.BACKGROUND,
                borderColor: COLORS.BORDER,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: formatTooltip } },
            },
            scales: {
                x: { 
                    title: { 
                        display: true,
                        text: xAxisLabel || dataLabels 
                    },
                    grid: {
                        color: COLORS.ACCENT,  // color for the vertical grid lines
                    } 
                },
                y: { 
                    title: { 
                        display: true, 
                        text: 'Load (kW)' 
                    }, 
                    min: minValue,
                    grid: {
                        color: COLORS.ACCENT,  // color for the horizontal grid lines
                    } 
                }
            }
        }
    });
}

// Function to limit decimal numbers to a maximum of 3:
function formatNumber(value) {
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
}
// Function to calculate the statistics needed for the tooltips
function calculateStats(arr) {
    const sortedArr = [...arr].sort((a, b) => a - b);
    const min = sortedArr[0];
    const max = sortedArr[sortedArr.length - 1];
    const q1 = sortedArr[Math.floor(sortedArr.length / 4)];
    const median = sortedArr[Math.floor(sortedArr.length / 2)];
    const q3 = sortedArr[Math.floor((3 * sortedArr.length) / 4)];
  
    return { min, q1, median, q3, max };
  }

// Load and process the datasets
Promise.all([
    d3.csv(DATASETS.LOAD),
    d3.csv(DATASETS.LOAD_DT)
]).then(function([loadData, loadDtData]) {
    maxDate = loadData[loadData.length - 1].Time;
    initLoadChart(loadData);
    initBoxplotChart('boxplotChart', loadDtData, 'hour', 'Hourly Load (kW)', 'Hour');
    initBoxplotChart('weeklyBoxplotChart', loadDtData, 'dayofweek', 'Weekly Load (kW)', 'Day of Week');
    initBoxplotChart('monthlyBoxplotChart', loadDtData, 'month', 'Monthly Load (kW)', 'Month');
    initBoxplotChart('yearlyBoxplotChart', loadDtData, 'year', 'Yearly Load (kW)', 'Year');
}).catch(function(error) {
    console.log("An error occurred while loading the datasets:", error);
});