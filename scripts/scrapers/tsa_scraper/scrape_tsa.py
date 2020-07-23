import requests
import pandas as pd
from bs4 import BeautifulSoup as bs
from datetime import datetime as dt

def update_data(html,name,log):
    soup = bs(html, 'html.parser')

    tr_elements = soup.find_all('tr')[::-1][:-1]

    new_df = pd.DataFrame(columns=['Date','2020','2019'])

    for i, tr in enumerate(tr_elements):
        row = []
        for td in tr.find_all('td'):
            row.append(td.text.replace(',',''))

        if(len(row) == 3):
            new_df.loc[i] = row

    old_df = pd.read_csv('tsa_scraper/tsa-data.csv')

    df = pd.DataFrame(columns=['Date','2020','2019'])

    for i, date in enumerate(old_df['Date'].values):
        if date not in new_df['Date'].values:
            df.loc[len(df)] = old_df.loc[i]
        else:
            break

    df = df.append(new_df)
    log.write('({})\t\t{}:\t\tAdding {} date(s) to csv file...\n'.format(name,dt.now(), len(df) - len(old_df)))


    df.to_csv('tsa_scraper/tsa-data.csv',index= False)

def scrape():
    name = 'TSA Scraper'
    log = open('log.txt','a')
    log.write('({})\t\t{}:\t\tRunning script\n'.format(name,dt.now()))

    url = 'https://www.tsa.gov/coronavirus/passenger-throughput'
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