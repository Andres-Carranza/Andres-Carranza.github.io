
async function chartData() {
    const ctx = document.getElementById('tsa').getContext('2d');
    const data = await getData();

    const myChart = new Chart(ctx, {
        data: {
            labels: data['Dates'],
            datasets: [
                {
                    label: '# of Passengers',
                    data: data['2020'],
                    fill: false,
                    yAxisID: "left",
                    borderColor: 'rgba(13, 186, 79, 1)',
                    backgroundColor: 'rgba(13, 186, 79, 0.5)',
                    borderWidth: 1,
                    pointRadius: 3,
                    type: 'line'
              },
              {
                  label: '% change',
                  data: data['change'],
                  fill: false,
                  yAxisID: "right",
                  borderColor: 'blue',
                  backgroundColor: 'blue',
                  borderWidth: 1,
                  pointRadius: 3,
                  type: 'line'
            }
            ]
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0,
                    }
                }],
                yAxes: [{
                  position: "left",
                  id: "left",
                }, {
                  position: "right",
                  id: "right",
                  ticks: {
                      callback: function(value, index, values) {
                          return value + "%";
                      }
                  }
                }]
            },
            tooltips: {
                callbacks: {
                      label: function(tooltipItem, data) {
                        var value = tooltipItem.value;
                        if (tooltipItem.datasetIndex == 0){
                            if(parseInt(value) >= 1000)
                                value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        }
                        else{
                            value = Math.round((parseFloat(value)) * 100) / 100;
                            value = value +'%'
                        }
                        return data.datasets[tooltipItem.datasetIndex].label +': ' + value
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
    const response= await fetch('scripts/scrapers/tsa_scraper/tsa-data.csv')
    const raw_data = await response.text()
    
    const csv_data = d3.csvParse(raw_data)
    
    const data = {'Dates': [],'2020': [], 'change': []};

    const threshold = csv_data.length  - 60

    csv_data.forEach(function (row, index) {
        if( index > threshold) {
            date = row['Date'].split('/')
            data['Dates'].push(date[0] +'/' + date[1])            
            data['2020'].push(row['2020'])
            data['change'].push(( (row['2020'] / row['2019']) - 1) * 100)
        }
    })
    return data
}

chartData()