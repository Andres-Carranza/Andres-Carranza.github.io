
async function chartData() {
    const ctx = document.getElementById('rpms-projections').getContext('2d');
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
                label: 'Counterfactual',
                data: data['Counterfactual'],
                fill: false,
                borderColor: 'purple',
                backgroundColor: 'purple',
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
                        maxTicksLimit: 12
                    }
                }],
                
                yAxes: [{
                    ticks: {
                        maxTicksLimit: 5,
                    }      
                }]
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
    
    const data = {'Dates': [],'Actual': [], 'Pessimistic': [], 'Baseline': [], 'Optimistic': [], 'Counterfactual': []};

    const threshold =  0

    csv_data.forEach(function (row, index) {
        if( index > threshold) {
            if (row['Actual'] == '' && row['Baseline'] == '')
                return
                
            for (const [key, value] of Object.entries(row)) {
                if(value == '')
                    row[key] = NaN
            }

            data['Dates'].push(row['Date'])
            data['Actual'].push(row['Actual']/1000000000)
            data['Pessimistic'].push(row['Pessimistic']/1000000000)
            data['Baseline'].push(row['Baseline']/1000000000)
            data['Optimistic'].push(row['Optimistic']/1000000000)
            data['Counterfactual'].push(row['Counterfactual']/1000000000)
        }
    })
    return data
}

chartData()