import requests
import pandas as pd
from datetime import datetime as dt

def update_data(covid,json,name,log):
    df = pd.read_json(json)
    df = df[df.Province == ''].reset_index()

    num_dates = 0
    for index, row in df.iterrows():
        if index == 0:
            continue
        date = str(df.loc[index,'Date'])[:10].split('-')
        if date[1][0] == '0':
            date[1] = date[1][1]
        if date[2][0] == '0':
            date[2] = date[2][1]
        date = date[1] + '/' + date[2] + '/' + date[0]

        cases = df.loc[index,'Confirmed'] - df.loc[index - 1 , 'Confirmed']
        deaths = df.loc[index,'Deaths'] - df.loc[index - 1 , 'Deaths']

        covid.loc[len(covid)] =  [date,cases,deaths]
        num_dates+=1


    log.write('({})\t{}:\t\tAdding {} date(s) to csv file...\n'.format(name,dt.now(), num_dates))

    covid.to_csv('covid_scraper/covid-data.csv', index = False)

def scrape():
    name = 'Covid-19 Scraper'
    log = open('log.txt','a')
    log.write('({})\t{}:\t\tRunning script\n'.format(name,dt.now()))

    covid = pd.read_csv('covid_scraper/covid-data.csv')

    start_date = covid.loc[len(covid)-1,'date'].split('/')

    if len(start_date[0]) == 1:
        start_date[0]='0'+start_date[0]
    if len(start_date[1]) == 1:
        start_date[1]='0'+start_date[1]

    start_date = '{}-{}-{}T00:00:00Z'.format(start_date[2],start_date[0],start_date[1])

    end_date = str(dt.now())[:19].replace(' ', 'T')+'Z'
    url = "https://api.covid19api.com/country/united-states?from={}&to={}".format(start_date,end_date)
    
    log.write('({})\t{}:\t\tRequesting data...\n'.format(name,dt.now()))

    response = None
    try: 
        response = requests.get(url)

        if response.status_code == 200:
            log.write('({})\t{}:\t\tData received\n'.format(name,dt.now()))

            log.write('({})\t{}:\t\tUpdating csv file..\n'.format(name,dt.now()))
            try:
                update_data(covid,response.text, name, log)
                log.write('({})\t{}:\t\tData written to csv\n'.format(name,dt.now()))
            except:
                 log.write('({})\t{}:\t\tError writing data to csv\n'.format(name,dt.now()))

        else:
            log.write('({})\t{}:\t\tError retrieving data; Status code:{}\n'.format(name,dt.now(), response.status_code))

    except:
            log.write('({})\t{}:\t\tError retrieving data; Response failed\n'.format(name,dt.now()))
        
    log.write('({})\t{}:\t\tFinished script\n'.format(name,dt.now()))
    log.close()