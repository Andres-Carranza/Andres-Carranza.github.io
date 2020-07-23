import requests
import pandas as pd
from datetime import datetime as dt
from io import StringIO

def update_data(claims,df,name,log):
    num_dates = 0
    for index, row in df.iterrows():
        date = str(df.loc[index,'DATE']).split('-')
        if date[1][0] == '0':
            date[1] = date[1][1]
        if date[2][0] == '0':
            date[2] = date[2][1]
        date = date[1] + '/' + date[2] + '/' + date[0]


        claims.loc[len(claims)] =  [date,df.loc[index,'ICSA']]
        num_dates+=1


    log.write('({})\t{}:\t\tAdding {} date(s) to csv file...\n'.format(name,dt.now(), num_dates))

    claims.to_csv('claims_scraper/claims-data.csv', index = False)

def scrape():
    name = 'Claims Scraper'
    log = open('log.txt','a')
    log.write('({})\t{}:\t\tRunning script\n'.format(name,dt.now()))

    claims = pd.read_csv('claims_scraper/claims-data.csv')

    start_date = claims.loc[len(claims)-1,'date'].split('/')
    
    start_date = dt(year=int(start_date[2]), month=int(start_date[0]), day=int(start_date[1]))
    
    start_date = str(start_date).split(' ')[0]
    end_date = str(dt.now()).split(' ')[0]

    url = 'https://fred.stlouisfed.org/graph/fredgraph.csv?bgcolor=%23e1e9f0&chart_type=line&drp=0&fo=open%20sans&graph_bgcolor=%23ffffff&height=450&mode=fred&recession_bars=on&txtcolor=%23444444&ts=12&tts=12&width=1168&nt=0&thu=0&trc=0&show_legend=yes&show_axis_titles=yes&show_tooltip=yes&id=ICSA&scale=left&cosd={}&line_color=%234572a7&link_values=false&line_style=solid&mark_type=none&mw=3&lw=2&ost=-99999&oet=99999&mma=0&fml=a&fq=Weekly%2C%20Ending%20Saturday&fam=avg&fgst=lin&line_index=1&transformation=lin&vintage_date={}&revision_date={}&nd={}'.format(start_date,end_date,end_date,start_date)    
    log.write('({})\t{}:\t\tRequesting data...\n'.format(name,dt.now()))

    response = None
    try: 
        response = requests.get(url)

        if response.status_code == 200:
            log.write('({})\t{}:\t\tData received\n'.format(name,dt.now()))

            log.write('({})\t{}:\t\tUpdating csv file..\n'.format(name,dt.now()))
            try:
                df = pd.read_csv(StringIO(response.text))
                df=df[df.DATE!=start_date]

                update_data(claims,df, name, log)
                log.write('({})\t{}:\t\tData written to csv\n'.format(name,dt.now()))
            except:
                 log.write('({})\t{}:\t\tError writing data to csv\n'.format(name,dt.now()))

        else:
            log.write('({})\t{}:\t\tError retrieving data; Status code:{}\n'.format(name,dt.now(), response.status_code))

    except:
            log.write('({})\t{}:\t\tError retrieving data; Response failed\n'.format(name,dt.now()))
        
    log.write('({})\t{}:\t\tFinished script\n'.format(name,dt.now()))
    log.close()


'''import requests
start_date = '2020-01-01'
end_date  = '2020-07-22'


url = 'https://fred.stlouisfed.org/graph/fredgraph.csv?bgcolor=%23e1e9f0&chart_type=line&drp=0&fo=open%20sans&graph_bgcolor=%23ffffff&height=450&mode=fred&recession_bars=on&txtcolor=%23444444&ts=12&tts=12&width=1168&nt=0&thu=0&trc=0&show_legend=yes&show_axis_titles=yes&show_tooltip=yes&id=ICSA&scale=left&cosd={}&line_color=%234572a7&link_values=false&line_style=solid&mark_type=none&mw=3&lw=2&ost=-99999&oet=99999&mma=0&fml=a&fq=Weekly%2C%20Ending%20Saturday&fam=avg&fgst=lin&line_index=1&transformation=lin&vintage_date={}&revision_date={}&nd={}'.format(start_date,end_date,end_date,start_date)
response = requests.get(url)

print(response.text)
'''