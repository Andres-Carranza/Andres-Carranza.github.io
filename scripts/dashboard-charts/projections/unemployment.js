
async function chartData() {
    const ctx = document.getElementById('unemployment').getContext('2d');
    const data = await getData();

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data['Dates'],
            datasets: [
                {
                    label: 'Actual',
                    data: data['actual'],
                    fill: false,
                    borderColor: 'blue',
                    backgroundColor: 'blue',
                    borderWidth: 2,
                    pointRadius: 0
              },
              {
                  label: 'Projections',
                  data: data['projections'],
                  fill: false,
                  borderColor: 'purple',
                  backgroundColor: 'purple',
                  borderWidth: 2,
                  pointRadius: 0
            }
            ]
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0,
                        maxTicksLimit: 10
                    },
                    gridLines: {
                      display: false
                    }
                }],
                
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString:'Unemployment Rate'
                    },
                    ticks: {
                        beginAtZero: true,
                    callback: function(value, index, values) {
                        return value + "%";
                    }
                }
                }]
            },
            tooltips: {
                intersect: false,
                callbacks: {
                      label: function(tooltipItem, data) {
                        return tooltipItem.value +'%'
                      }
                } 
              },
              legend: {
                  position: 'bottom'
              }
        }
    });
}

async function getData(){
    const response= await fetch('scripts/scrapers/unemployment_scraper/unemployment-data.csv')
    const raw_data = await response.text()
    
    const csv_data = d3.csvParse(raw_data)
    
    const data = {'Dates': [],'actual': [], 'projections': []};

    const threshold = csv_data.length  - 60

    csv_data.forEach(function (row, index) {

        for (const [key, value] of Object.entries(row)) {
            if(value == '')
                row[key] = NaN
        }

        if( index >= threshold) {
            data['Dates'].push(row['date'])
            data['actual'].push(row['actual'])
            data['projections'].push(row['projected'])
        }
    })
    return data
}

chartData()