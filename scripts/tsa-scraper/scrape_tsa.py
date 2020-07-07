import requests
import pandas as pd
from bs4 import BeautifulSoup as bs

def html_to_csv(html):
    soup = bs(html, 'html.parser')

    tr_elements = soup.find_all('tr')[::-1][:-1]

    df = pd.DataFrame(columns=['Date','2020','2019'])

    for i, tr in enumerate(tr_elements):
        row = []
        for td in tr.find_all('td'):
            row.append(td.text.replace(',',''))
        if(len(row) == 3):
            df.loc[i] = row
    df.to_csv('tsa-data.csv', index = False)

#url = 'https://www.tsa.gov/coronavirus/passenger-throughput'
#html = requests.get(url).content

file = open("tsa.html", "r")
html_to_csv(file.read())
file.close()
