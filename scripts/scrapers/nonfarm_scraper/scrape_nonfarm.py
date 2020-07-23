import requests
import pandas as pd
from bs4 import BeautifulSoup as bs
from datetime import datetime as dt


def update_data(html,name,log):
    soup = bs(html, 'html.parser')

    new_df = pd.DataFrame(columns=['date','actual','projected'])

    months = {'Jan':1,
              'Feb':2,
              'Mar':3,
              'Apr':4,
              'May':5,
              'Jun':6,
              'Jul':7,
              'Aug':8,
              'Sep':9,
              'Oct':10,
              'Nov':11,
              'Dec':12}

    for i, row in enumerate(soup.table.find_all('tr')):
        tds = row.find_all('td')
        if len(tds) != 4:
            continue
        date = tds[1].text.split(' ')
        date = str(months[date[0]]) + '/' + date[1]
        value = tds[2].text
        error = float(tds[3].text[2:])

        if error == 0:
            new_df.loc[i] = [date,value,value] 
        else:
            new_df.loc[i] = [date,'',value] 

    df = pd.read_csv('nonfarm_scraper/nonfarm-data.csv')

    old_len = len(df)

    for i, date in enumerate(df['date'].values):
        if date in new_df['date'].values:
            df = df.drop(i)

    df = df.append(new_df)
    log.write('({})\t\t{}:\t\tAdding {} date(s) to csv file...\n'.format(name,dt.now(), len(df) - old_len))

    df.to_csv('nonfarm_scraper/nonfarm-data.csv',index= False)

def scrape():
    name = 'NFarm Scraper'
    log = open('log.txt','a')
    log.write('({})\t\t{}:\t\tRunning script\n'.format(name,dt.now()))

    url = 'https://www.forecasts.org/labor-force.htm'
    log.write('({})\t\t{}:\t\tRequesting data...\n'.format(name,dt.now()))

    response = None
    try: 
        response = requests.get(url)

        if response.status_code == 200:
            log.write('({})\t\t{}:\t\tData received\n'.format(name,dt.now()))

            log.write('({})\t\t{}:\t\tUpdating csv file..\n'.format(name,dt.now()))
            try:
                update_data(response.content, name, log)
                log.write('({})\t\t{}:\t\tData written to csv\n'.format(name,dt.now()))
            except:
                 log.write('({})\t\t{}:\t\tError writing data to csv\n'.format(name,dt.now()))

        else:
            log.write('({})\t\t{}:\t\tError retrieving data; Status code:{}\n'.format(name,dt.now(), response.status_code))

    except:
            log.write('({})\t\t{}:\t\tError retrieving data; Response failed\n'.format(name,dt.now()))
        
    log.write('({})\t\t{}:\t\tFinished script\n'.format(name,dt.now()))
    log.close()
