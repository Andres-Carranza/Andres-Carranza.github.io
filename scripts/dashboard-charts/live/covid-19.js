
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
                  borderColor: '#c97f1c',
                  backgroundColor: '#c97f1c',
                  pointRadius: 0,
                  borderWidth: 2,
                  hitRadius: 0
            },
            {
              label: 'Deaths',
              data: data['Deaths'],
              fill: false,
              yAxisID: 'right',
              borderColor: '#700907',
              backgroundColor: '#700907',  
              pointRadius: 0,
              borderWidth: 2,
              hitRadius: 0
            }
            ]
        },
        options: {

            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                      unit: 'month'
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
                position: 'bottom'
            }
        }
    });
}

function calcMA(values) {
    means = [NaN,NaN, NaN]
    for(var i = 3; i< values.length - 3 ;i++){
        var sum = 0;
        for(var j = -3; j<=3; j++){
            sum+=values[i+j]
        }

        means.push(sum/7);
    }
    means.push(NaN)
    means.push(NaN)
    means.push(NaN)
    return means;
  }

async function getData(){
    const response= await fetch('scripts/scrapers/covid_scraper/covid-data.csv')
    const raw_data = await response.text()
    
    const csv_data = d3.csvParse(raw_data)
    
    const data = {'Dates': [],'Deaths': [], 'Cases': []};

    const threshold = 0
    var march =0;
    csv_data.forEach(function (row, index) {
        if( index >= threshold) {
            date = row['date'].split('/')

            if (date[0].length ==1 )
                date[0] = '0'+date[0]
            if (date[1].length ==1 )
                date[1] = '0'+date[1]

            if(row['date'] == '3/1/2020'){
                march = index
            }

            data['Dates'].push(date[2] +'-'+date[0]+'-'+date[1])

            data['Cases'].push(row['cases']/1000)
            data['Deaths'].push(row['deaths']/100)
        }
    })
    for (var i = 0; i< march; i++){
        data['Deaths'].shift()
        data['Dates'].shift()
        data['Cases'].shift()
    }
    return data
}

chartData()