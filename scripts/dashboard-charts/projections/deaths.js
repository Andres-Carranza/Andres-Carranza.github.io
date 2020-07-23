
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
                    borderColor: 'teal',
                    backgroundColor: 'teal',
                    borderWidth: 2,
                    pointRadius: 0
              },
              {
                  label: '7 day Moving Average',
                  data: data['ma'],
                  fill: false,
                  borderColor: 'blue',
                  backgroundColor: 'blue',
                  borderWidth: 2,
                  pointRadius: 0
            },
              {
                  label: 'Pessimistic',
                  data: data['pessimistic'],
                  fill: false,
                  borderColor: 'red',
                  backgroundColor: 'red',
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
          },
          {
              label: 'Optimistic',
              data: data['optimistic'],
              fill: false,
              borderColor: 'green',
              backgroundColor: 'green',
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
                    }
                }],
                
                yAxes: [{
                    display: false 
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
    means = [NaN,NaN, NaN]
    for(var i = 3; i< values.length - 3 ;i++){
        var sum = 0;
        for(var j = -3; j<=3; j++){
            sum+=parseInt(values[i+j])
        }
        means.push(sum/7);
    }
    means.push(NaN)
    means.push(NaN)
    means.push(NaN)
    return means;
  }

async function getData(){
    const covid_response= await fetch('scripts/scrapers/covid_scraper/covid-data.csv')
    const covid_data = await covid_response.text()
    
    const projections_response= await fetch('scripts/scrapers/covid_scraper/covid-projections.csv')
    const projections_data = await projections_response.text()
    
    const data = {'Dates': [],'ma':[],'deaths': [], 'pessimistic': [], 'baseline': [], 'optimistic': []};
    const threshold = 0

    const covid_csv = d3.csvParse(covid_data)
    covid_csv.forEach(function (row, index) {
        if( index >= threshold) {
            for (const [key, value] of Object.entries(row)) {
                if(value == '')
                    row[key] = NaN
            }
            date = row['date'].split('/')
            data['Dates'].push(date[0] +'/' + date[1])
            data['deaths'].push(row['deaths'])
        }
    })

    const projections_csv = d3.csvParse(projections_data)
    projections_csv.forEach(function (row, index) {
        if( index >= threshold) {
            for (const [key, value] of Object.entries(row)) {
                if(value == '')
                    row[key] = NaN
            }                       
            date = row['date'].split('/')
            if (!data['Dates'].includes(date[0] +'/' + date[1]))
                data['Dates'].push(date[0] +'/' + date[1])

            data['pessimistic'].push(row['pessimistic']),
            data['baseline'].push(row['baseline']),
            data['optimistic'].push(row['optimistic'])
        }
    })

    data['ma']= calcMA(data['deaths'])

    return data
}

chartData()