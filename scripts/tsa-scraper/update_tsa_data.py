import requests
import pandas as pd
from bs4 import BeautifulSoup as bs
from datetime import datetime as dt

log = open('log.txt','a')
log.write('{}: Running script\n'.format(dt.now()))

def html_to_csv(html):
    soup = bs(html, 'html.parser')

    tr_elements = soup.find_all('tr')[::-1][:-1]

    new_df = pd.DataFrame(columns=['Date','2020','2019'])

    for i, tr in enumerate(tr_elements):
        row = []
        for td in tr.find_all('td'):
            row.append(td.text.replace(',',''))

        if(len(row) == 3):
            new_df.loc[i] = row

    old_df = pd.read_csv('tsa-data.csv')

    df = pd.DataFrame(columns=['Date','2020','2019'])

    for i, date in enumerate(old_df['Date'].values):
        if date not in new_df['Date'].values:
            df.loc[len(df)] = old_df.loc[i]
        else:
            break

    df = df.append(new_df)
    log.write('{}: Adding {} date(s) to csv file...\n'.format(dt.now(), len(df) - len(old_df)))


    df.to_csv('tsa-data.csv',index= False)

url = 'https://www.tsa.gov/coronavirus/passenger-throughput'
log.write('{}: Requesting TSA data...\n'.format(dt.now()))

response = None
try: 
    response = requests.get(url)

    if response.status_code == 200:
        log.write('{}: TSA data received\n'.format(dt.now()))

        log.write('{}: Updating csv file..\n'.format(dt.now()))
        html_to_csv(response.content)
        log.write('{}: TSA data written to csv\n'.format(dt.now()))

    else:
        log.write('{}: Error retrieving TSA data; Status code:{}\n'.format(dt.now(), response.status_code))

except:
        log.write('{}: Error retrieving TSA data; Response failed\n'.format(dt.now()))
    
log.write('{}: Finished script\n'.format(dt.now()))
log.close()

'''
file = open("tsa.html", "r")
html_to_csv(file.read())
file.close()
'''