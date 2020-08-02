
async function chartData() {
    const ctx = document.getElementById('rpms-projections').getContext('2d');
    var data = await getData();
    var last = data[1]
    data = data[0]
    var aspectRatio = 1/.3
    if (screen.width <= 500)
        aspectRatio = 1/.79 
    else if (screen.width <= 700)
        aspectRatio = 1/.7
    else if (screen.width <= 1000)
        aspectRatio = 1/.5

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data['Dates'],
            datasets: [
                {
                    label: 'RPMs',
                    data: data['Actual'],
                    fill: false,
                    borderColor: 'navy',
                    backgroundColor: 'navy',
                    borderWidth: 2,
                    pointRadius: 0,   
                    hitRadius:0 ,
                    yAxisID: "left",
  
              },
              {
                label: 'Counterfactual RPMs',
                data: [],
                fill: false,
                borderColor: 'purple',
                backgroundColor: 'purple',
                borderWidth: 2,
                pointRadius: 0,   
                hitRadius:0, 
                yAxisID: "left",
                
              },
              {
                label: 'hide',
                data: data['Counterfactual'],
                fill: false,
                borderColor: 'purple',
                backgroundColor: 'purple',
                borderWidth: 2,
                pointRadius: 0,   
                hitRadius:0, 
                borderDash: [10,5],
                yAxisID: "left",
                
              },
              {
                label: 'hide',
                data: data['Baseline'],
                fill: false,
                borderColor: 'navy',
                backgroundColor: 'navy',
                borderWidth: 2,
                pointRadius: 0,   
                borderDash: [10,5],
                hitRadius:0  ,
                yAxisID: "left",
                
              },
              {
                label: 'RPMs % change compared to Counterfactual',
                data: data['changea'],
                fill: false,
                borderColor: '#58b7cc',
                backgroundColor: '#58b7cc',
                borderWidth: 2,
                pointRadius: 0,   
                hitRadius:0,   
                yAxisID: "right",
        
              },
              {
                label: 'hide',
                data: data['changeb'],
                fill: false,
                borderColor: '#58b7cc',
                backgroundColor: '#58b7cc',
                borderWidth: 2,
                pointRadius: 0,   
                hitRadius:0,
                borderDash: [10,5]   ,
                yAxisID: "right",
              }
            ]
        },
        options: {
            aspectRatio: aspectRatio,
            onResize: function(chart, size){
                if( screen.width <= 500){
                    chart.aspectRatio= 1/.9;
                }
                else if( screen.width <= 700){
                    chart.aspectRatio= 1/.7;
                }
                else if( screen.width <= 1000){
                    chart.aspectRatio= 1/.5;
                }
                else {
                    chart.aspectRatio= 1/.3;
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
                    position: "left",
                    id: "left",
                    
                    scaleLabel: {
                        display: true,
                        labelString:'RPMs (billions)'
                    },
                    ticks: {
                        beginAtZero: true,
                    }
                  }, {
                    position: "right",
                    id: "right",
                    scaleLabel: {
                        display: true,
                        labelString:'% Change'
                    },
                    gridLines: {
                        display: false
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
                        if(tooltipItem.index== last &&( tooltipItem.datasetIndex == 3 || tooltipItem.datasetIndex == 5) ){
                            return;
                        }
                        value = Math.round((parseFloat(value)) * 100) / 100;

                        if(tooltipItem.datasetIndex == 4 ||tooltipItem.datasetIndex == 5)
                            return value+'%'

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
                          return date[1] +'/'+date[0]
                      }
                } 
            },
            legend: {
                position: 'bottom',
                labels: {
                    filter: function(item, chart) {
                        return !item.text.includes('hide');
                    }
                }
            }
        }
    });
}

async function getData(){
    const response= await fetch('scripts/scrapers/rpms_scraper/rpms-data.csv')
    const raw_data = await response.text()
    
    const csv_data = d3.csvParse(raw_data)
    
    const data = {'Dates': [],'Actual': [],'changea': [],'changeb': [],  'Baseline': [], 'Counterfactual': []};

    const threshold =  2
    var last = 0
    csv_data.forEach(function (row, index) {
        if( index >= threshold) {

            if (row['Actual'] == '' && row['Baseline'] == ''){
                return
            }
                
            for (const [key, value] of Object.entries(row)) {
                if(value == '')
                    row[key] = NaN
            }

            date = row['Date'].split('/')

            if (date[0].length ==1 )
                date[0] = '0'+date[0]
       
            date = date[1] + '-'+ date[0] + '-01'
            
            if ( !isNaN(row['Actual'])){
                last = index
            }

            data['Dates'].push(date)
            data['Actual'].push(row['Actual']/1000000000)
            data['Baseline'].push(row['Baseline']/1000000000)
            data['Counterfactual'].push(row['Counterfactual']/1000000000)
            data['changea'].push(100*(row['Actual'] / row['Counterfactual']-1))
            data['changeb'].push(100*(row['Baseline'] / row['Counterfactual']-1))
        }
    })

    return [data,last - threshold]
}

chartData()