
async function chartData() {
    const ctx = document.getElementById('tsa-chart').getContext('2d');
    const data = await getData();

    Chart.defaults.global.defaultFontSize = 13;
    Chart.defaults.global.defaultFontColor = 'black';
    Chart.defaults.global.legend.display = false;
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data['Dates'],
            datasets: [
                {
                    label: '# of Passengers',
                    data: data['2020'],
                    fill: false,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderWidth: 1,
                    pointRadius: 3
              }
            ]
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        maxTicksLimit: 10
                    }
                }],
                
                yAxes: [{
                    ticks: {
                        maxTicksLimit: 5
                    }
                }]
            },
            title: {
                display: true,
                text: '# of Daily Passengers in the Last 60 Days',
                fontSize: 25
            }


        }
    });
}

async function getData(){
    const response= await fetch('scripts/tsa-scraper/tsa-data.csv')
    const raw_data = await response.text()
    
    const csv_data = d3.csvParse(raw_data)
    
    const data = {'Dates': [],'2020': [], '2019': []};

    const threshold = csv_data.length  - 60

    csv_data.forEach(function (row, index) {
        if( index > threshold) {
            data['Dates'].push(row['Date'])
            data['2020'].push(row['2020'])
            data['2019'].push(row['2019'])
        }
    })
    return data
}

chartData()