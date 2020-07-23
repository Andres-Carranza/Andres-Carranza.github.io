import requests
import pandas as pd
from bs4 import BeautifulSoup as bs
from datetime import datetime as dt


def update_data(html,name,log):
    soup = bs(html, 'html.parser')

    update = [] #contains rpms post 1/2020

    for tr in soup.find_all('tr', {'class':'dataTDRight'}):
        tds = tr.find_all('td')
        if int(tds[0].text) < 2020 or tds[1].text == 'TOTAL':
            continue

        update.append(tds[2].text.replace(',','')+'000')

    df = pd.read_csv('rpms_scraper/rpms-data.csv')

    new_dates = 0
    for i, val in enumerate(update):
        if str(df.loc[i,'Actual']) == 'nan':
            new_dates+=1

        df.loc[i,'Actual'] = val
        if i == 5:
            df.loc[i,['Pessimistic','Baseline','Optimistic']] = [val,val,val]
        elif i == 1:
            df.loc[i,'Counterfactual'] = val

    df.to_csv('rpms_scraper/rpms-data.csv',index=False)
    log.write('({})\t\t{}:\t\tAdding {} date(s) to csv file...\n'.format(name,dt.now(),new_dates))

    df.to_csv('rpms_scraper/rpms-data.csv',index= False)

def scrape():
    name = 'RPMs Scraper'
    log = open('log.txt','a')
    log.write('({})\t\t{}:\t\tRunning script\n'.format(name,dt.now()))

    url = 'https://www.transtats.bts.gov/Data_Elements.aspx?Data=3'
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
