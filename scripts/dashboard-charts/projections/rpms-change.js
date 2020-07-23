
async function chartData() {
    const ctx = document.getElementById('rpms-change').getContext('2d');
    const data = await getData();


    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data['Dates'],
            datasets: [
                {
                    label: 'Actual',
                    data: data['Actual'],
                    fill: false,
                    borderColor: 'blue',
                    backgroundColor: 'blue',
                    borderWidth: 2,
                    pointRadius: 0      
              },
              {
                label: 'Pessimistic',
                data: data['Pessimistic'],
                fill: false,
                borderColor: 'red',
                backgroundColor: 'red',
                borderWidth: 2,
                pointRadius: 0             
              },
              {
                label: 'Baseline',
                data: data['Baseline'],
                fill: false,
                borderColor: 'orange',
                backgroundColor: 'orange',
                borderWidth: 2,
                pointRadius: 0                
              },
              {
                label: 'Optimistic',
                data: data['Optimistic'],
                fill: false,
                borderColor: 'limeGreen',
                backgroundColor: 'limeGreen',
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
                        maxTicksLimit: 12
                    },
                    gridLines: {
                      display: false
                    }
                }],
                
                yAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString:'% Change'
                  },
                  ticks: {
                    beginAtZero: true,
                    maxTicksLimit: 7,
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
                          return Math.round((parseFloat(value)) * 100) / 100 + '%';
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
    const response= await fetch('scripts/scrapers/rpms_scraper/rpms-data.csv')
    const raw_data = await response.text()
    
    const csv_data = d3.csvParse(raw_data)
    
    const data = {'Dates': [],'Actual': [], 'Pessimistic': [], 'Baseline': [], 'Optimistic': []};

    const threshold =  2

    csv_data.forEach(function (row, index) {
        if( index >= threshold) {

            if (row['Actual'] == '' && row['Baseline'] == '')
                return
                
            for (const [key, value] of Object.entries(row)) {
                if(value == '')
                    row[key] = NaN
            }

            data['Dates'].push(row['Date'])
            data['Actual'].push(100*(row['Actual']/row['Counterfactual']-1))
            data['Pessimistic'].push(100*(row['Pessimistic']/row['Counterfactual']-1))
            data['Baseline'].push(100*(row['Baseline']/row['Counterfactual']-1))
            data['Optimistic'].push(100*(row['Optimistic']/row['Counterfactual']-1))
        }
    })
    return data
}

chartData()