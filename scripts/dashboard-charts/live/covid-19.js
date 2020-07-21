
async function chartData() {
    const ctx = document.getElementById('covid19').getContext('2d');
    const data = await getData();
    Chart.defaults.global.defaultFontColor = 'lightgray';

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data['Dates'],
            datasets: [
                {
                    label: '# of Passengers',
                    data: data['2020'],
                    fill: false,
                    borderColor: 'rgba(13, 186, 79, 1)',
                    backgroundColor: 'rgba(13, 186, 79, 0.5)',
                    borderWidth: 1,
                    pointRadius: 3
              }
            ]
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0,
                        maxTicksLimit: 10,
                    }
                      
                }],
                yAxes: [{
                    display: false
                    
                }],
            },

            tooltips: {
                callbacks: {
                      label: function(tooltipItem, data) {
                          var value = data.datasets[0].data[tooltipItem.index];
                          if(parseInt(value) >= 1000){
                                     return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                  } else {
                                     return value;
                                  }
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