
async function chartData() {
    const ctx = document.getElementById('unemployment').getContext('2d');
    var data = await getData();
    var aspectRatio = 1/.5
    
    if (screen.width <= 500)
        aspectRatio = 1/.7   
    else if (screen.width <= 700)
        aspectRatio = 1/.5
    else if (screen.width <= 1000)
        aspectRatio = 1/.3

    var last = data[1]
    data = data[0]

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data['Dates'],
            datasets: [
                {
                    label: 'Actual',
                    data: data['actual'],
                    fill: false,
                    borderColor: 'rgb(252, 219, 3)',
                    backgroundColor: 'rgb(252, 219, 3)',
                    borderWidth: 2,
                    pointRadius: 0,
                    hitRadius:0   
              },
              {
                  label: 'Projections',
                  data: data['projections'],
                  fill: false,
                  borderColor: 'rgb(252, 219, 3)',
                  backgroundColor: 'rgb(252, 219, 3)',
                  borderWidth: 2,
                  pointRadius: 0,
                  borderDash: [10,5],
                  hitRadius:0
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
                        var value = tooltipItem.value;
                        if(tooltipItem.index== last && tooltipItem.datasetIndex == 1){
                            return;
                        }
                        return tooltipItem.value +'%'
                      },
                      title: function(tooltipItem, data){
                          var date = tooltipItem[0].xLabel.split('-')
                        
                          if (date[1][0] == '0')
                                date[1] = date[1].charAt(1)
                          if( date[2][0] == '0')
                            date[2] = date[2].charAt(1)
                          return date[1] +'/'+date[0]
                      }
                } 
              },
              legend: {
                 display: false,
                 onClick: (e) => e.stopPropagation()
              }
        }
    });
}

async function getData(){
    const response= await fetch('scripts/scrapers/unemployment_scraper/unemployment-data.csv')
    const raw_data = await response.text()
    
    const csv_data = d3.csvParse(raw_data)
    
    const data = {'Dates': [],'actual': [], 'projections': []};

    const threshold = 2

    csv_data.forEach(function (row, index) {

        for (const [key, value] of Object.entries(row)) {
            if(value == '')
                row[key] = NaN
        }   
        date = row['date'].split('/')

        if (date[0].length ==1 )
            date[0] = '0'+date[0]

        date = date[1] + '-'+ date[0] + '-01'
        if( index >= threshold) {
            if ( !isNaN(row['actual'])){
                last = index
            }

            data['Dates'].push(date)
            data['actual'].push(row['actual'])
            data['projections'].push(row['projected'])
        }
    })
    return [data,last - threshold]
}

chartData()