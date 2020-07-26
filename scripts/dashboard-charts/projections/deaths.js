
async function chartData() {
    const ctx = document.getElementById('deaths').getContext('2d');
    const data = await getData();


    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data['Dates'],
            datasets: [
                {
                    label: 'Actual',
                    data: data['deaths'],
                    fill: false,
                    borderColor: 'blue',
                    backgroundColor: 'blue',
                    borderWidth: 2,
                    pointRadius: 0
              },
            {
                label: 'Baseline',
                data: data['baseline'],
                fill: false,
                borderColor: 'orange',
                backgroundColor: 'orange',
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
                    labelString:'Deaths'
                },
                }]
            },
            tooltips: {
                intersect: false,
                callbacks: {
                      label: function(tooltipItem, data) {
                        var value = tooltipItem.value;
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
    projections_csv.forEach(function (row, index) {
        if( index >= threshold) {
            for (const [key, value] of Object.entries(row)) {
                if(value == '')
                    row[key] = NaN
            }                  
            date = row['date'].split('/')
            data['Dates'].push(date[0] +'/' + date[1])

            if ( !isNaN(row['actual_deaths'])){
                last = index
            }

            data['deaths'].push(row['actual_deaths'])     



            data['baseline'].push(row['predicted_deaths_mean'])
        }
    })

    data['deaths']= calcMA(data['deaths'])

    data['baseline'][last] = data['deaths'][last]

    return data
}

chartData()