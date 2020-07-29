
async function chartData() {
    const ctx = document.getElementById('unemployment-claims').getContext('2d');
    const data = await getData();
    var aspectRatio = 1/.5
    
    if (screen.width <= 500)
        aspectRatio = 1/.7   
    else if (screen.width <= 700)
        aspectRatio = 1/.5
    else if (screen.width <= 1000)
        aspectRatio = 1/.3

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data['Dates'],
            datasets: [
                {
                    label: 'Jobless Claims',
                    data: data['claims'],
                    fill: false,
                    borderColor: 'rgb(252, 219, 3)',
                    backgroundColor: 'rgb(252, 219, 3)',
                    borderWidth: 2,
                    pointRadius: 0,
                    hitRadius: 0
              }
            ]
        },
        options: {
            aspectRatio: aspectRatio,
            onResize: function(chart, size){
                if( screen.width <= 500){
                    chart.aspectRatio= 1/.7;
                }
                else if( screen.width <= 700){
                    chart.aspectRatio= 1/.5;
                }
                else if( screen.width <= 1000){
                    chart.aspectRatio= 1/.3;
                }
                else {
                    chart.aspectRatio= 1/.5;
                }
            },
            scales: {
                xAxes: [{
                     type: 'time',
                    time: {
                      unit: 'month'
                    }
                }],
                
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Initial Claims (millions)'
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
                          var value = data.datasets[0].data[tooltipItem.index];
                          value = Math.round((parseFloat(value)) * 100) / 100;
                          if(parseInt(value) >= 1000){
                                     return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                  } else {
                                     return value.toString();
                                  }
                      },
                      title: function(tooltipItem, data){
                          var date = tooltipItem[0].xLabel.split('-')
                        
                          if (date[1][0] == '0')
                                date[1] = date[1].charAt(1)
                          if( date[2][0] == '0')
                            date[2] = date[2].charAt(1)
                          return date[1] +'/'+date[2]+'/'+date[0]
                      }
                } 
            },
            legend: {
                display: false
            }
        }
    });
}

async function getData(){
    const response= await fetch('scripts/scrapers/claims_scraper/claims-data.csv')
    const raw_data = await response.text()
    
    const csv_data = d3.csvParse(raw_data)
    
    const data = {'Dates': [],'claims': []};

    const threshold = csv_data.length  - 60
    var march = 0;
    csv_data.forEach(function (row, index) {
        if( index >= threshold) {
            date = row['date'].split('/')

            if (date[0].length ==1 )
                date[0] = '0'+date[0]
            if (date[1].length ==1 )
                date[1] = '0'+date[1]

            if(row['date'] == '2/29/2020'){
                march = index
            }

            data['Dates'].push(date[2] +'-'+date[0]+'-'+date[1])
            data['claims'].push(row['claims']/1000000)
        }
    })

    for (var i = 0; i< march; i++){
        data['claims'].shift()
        data['Dates'].shift()
    }
    return data
}

chartData()