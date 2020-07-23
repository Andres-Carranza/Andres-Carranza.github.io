
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
                  label: 'Cases',
                  data: data['Cases'],
                  fill: false,
                  yAxisID: 'left',
                  borderColor: 'blue',
                  backgroundColor: 'blue',
                  pointRadius: 0,
                  borderWidth: 2
            },
            {
              label: 'Deaths',
              data: data['Deaths'],
              fill: false,
              yAxisID: 'right',
              borderColor: 'purple',
              backgroundColor: 'purple',      
              pointRadius: 0,
              borderWidth: 2
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
                    }
                      
                }],
                yAxes: [{
                  position: "left",
                  id: "left",
                  scaleLabel: {
                  labelString: 'Cases (thousands)',
                  display: true
                  },
                  ticks: {
                      beginAtZero: true,
                      maxTicksLimit: 7
                  }
                }, {
                  position: "right",
                  id: "right",
                  scaleLabel: {
                  labelString: 'Deaths (hundreds)',
                  display: true
                  },
                  gridLines: {
                    display: false
                  },
                  ticks: {
                      beginAtZero: true,
                      maxTicksLimit: 7
                  }
                }]
            },

            tooltips: {
                intersect: false,
                callbacks: {
                      label: function(tooltipItem, data) {
                          var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                          value = Math.round((parseFloat(value)) * 100) / 100;

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
    const response= await fetch('scripts/scrapers/covid_scraper/covid-data.csv')
    const raw_data = await response.text()
    
    const csv_data = d3.csvParse(raw_data)
    
    const data = {'Dates': [],'Deaths': [], 'Cases': []};

    const threshold = 0

    csv_data.forEach(function (row, index) {
        if( index > threshold) {
            date = row['date'].split('/')
            data['Dates'].push(date[0] +'/' + date[1])
            data['Cases'].push(row['cases']/1000)
            data['Deaths'].push(row['deaths']/100)
        }
    })
    return data
}

chartData()