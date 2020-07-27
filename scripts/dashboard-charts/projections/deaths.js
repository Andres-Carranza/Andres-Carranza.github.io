
async function chartData() {
    const ctx = document.getElementById('deaths').getContext('2d');
    var data = await getData();

    var last = data[1]
    data = data[0]

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data['Dates'],
            datasets: [
                {
                    label: 'Actual',
                    data: data['deaths'],
                    fill: false,
                    borderColor: '#700907',
                    backgroundColor: '#700907',
                    borderWidth: 2,
                    pointRadius: 0,
                    hitRadius:0
              },
            {
                label: 'Baseline',
                data: data['baseline'],
                fill: false,
                borderColor: '#700907',
                backgroundColor: '#700907',
                borderWidth: 2,
                pointRadius: 0,
                borderDash: [10,5],
                hitRadius:0
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
                  scaleLabel: {
                    display: true,
                    labelString:'Deaths',
                    beginAtZero: true
                },
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
               display: false
            }
        }
    });
}


function calcMA(values) {
    means = [NaN,NaN, NaN,NaN,NaN,NaN]
    for(var i = 6; i< values.length - 3 ;i++){
        var sum = 0;
        for(var j = -6; j<=0; j++){
            sum+=parseInt(values[i+j])
        }
        means.push(sum/7);
    }
    return means;
  }

async function getData(){
    const projections_response= await fetch('scripts/scrapers/covid_scraper/covid-projections.csv')
    const projections_data = await projections_response.text()
    
    const data = {'Dates': [],'deaths': [],  'baseline': []};
    const threshold = 0 


    const projections_csv = d3.csvParse(projections_data)
    var last = 0
    var march = 0;
    projections_csv.forEach(function (row, index) {
        if( index >= threshold) {
            for (const [key, value] of Object.entries(row)) {
                if(value == '')
                    row[key] = NaN
            }                  
            date = row['date'].split('/')

            if (date[0].length ==1 )
                date[0] = '0'+date[0]
            if (date[1].length ==1 )
                date[1] = '0'+date[1]

            if(row['date'] == '3/1/2020'){
                march = index
            }

            data['Dates'].push(date[2] +'-'+date[0]+'-'+date[1])


            if ( !isNaN(row['actual_deaths'])){
                last = index
            }

            data['deaths'].push(row['actual_deaths'])     



            data['baseline'].push(row['predicted_deaths_mean'])
        }
    })

    data['deaths']= calcMA(data['deaths'])

    data['baseline'][last] = data['deaths'][last]

    for (var i = 0; i< march; i++){
        data['deaths'].shift()
        data['Dates'].shift()
        data['baseline'].shift()
    }

    return [data,last - march]
}

chartData()