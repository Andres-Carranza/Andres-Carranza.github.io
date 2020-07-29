import requests
import pandas as pd
from datetime import datetime as dt
from datetime import timedelta
import io

def update_data(response,projection_date,name,log):
    df = pd.read_csv(io.StringIO(response.content.decode('utf-8')))

    del df['total_deaths']
    del df['predicted_total_deaths_mean']
    del df['predicted_total_deaths_lower']
    del df['predicted_total_deaths_upper']

    del df['predicted_total_infected_mean']
    del df['predicted_total_infected_lower']
    del df['predicted_total_infected_upper']

    del df['r_values_mean']


    for i, row in df.iterrows():
        
        date = row['date'].split('-')
        if date[1][0] == '0':
            date[1] = date[1][1]
        if date[2][0] == '0':
            date[2] = date[2][1]

        date = date[1] + '/' + date[2] + '/' + date[0]
        df.loc[i,'date'] = date

        if date == '6/25/2020':
            df.loc[i,'actual_deaths'] = 657

    df.to_csv('covid_scraper/covid-projections.csv', index=False)

    log.write('({})\t{}:\t\tAdding projections from {} to csv file...\n'.format(name,dt.now(),str(projection_date).split(' ')[0]))


def scrape():
    name = 'C19-Proj. Scraper'
    log = open('log.txt','a')
    log.write('({})\t{}:\t\tRunning script\n'.format(name,dt.now()))

    url = "https://raw.githubusercontent.com/youyanggu/covid19_projections/master/projections/{}/US.csv" 
    log.write('({})\t{}:\t\tRequesting data...\n'.format(name,dt.now()))

    date = dt.now()

    response = None
    try: 
        response = requests.get(url.format(str(date)).split(' ')[0])

        while response.status_code !=200:
            date = date - timedelta( days=1)
            response = requests.get(url.format(str(date).split(' ')[0]))

        if response.status_code == 200:
            log.write('({})\t{}:\t\tData received\n'.format(name,dt.now()))

            log.write('({})\t{}:\t\tUpdating csv file..\n'.format(name,dt.now()))
            try:
                update_data(response,date, name, log)
                log.write('({})\t{}:\t\tData written to csv\n'.format(name,dt.now()))
            except:
                 log.write('({})\t{}:\t\tError writing data to csv\n'.format(name,dt.now()))

        else:
            log.write('({})\t{}:\t\tError retrieving data; Status code:{}\n'.format(name,dt.now(), response.status_code))

    except:
            log.write('({})\t{}:\t\tError retrieving data; Response failed\n'.format(name,dt.now()))

    log.write('({})\t{}:\t\tFinished script\n'.format(name,dt.now()))
    log.close()  


