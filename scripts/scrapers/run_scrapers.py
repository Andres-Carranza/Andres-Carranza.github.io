import schedule
import time
from tsa_scraper import scrape_tsa
from covid_scraper import scrape_covid
from claims_scraper import scrape_claims
from unemployment_scraper import scrape_unemployment
from nonfarm_scraper import scrape_nonfarm
from covid_scraper import scrape_covid_projections
from rpms_scraper import scrape_rpms
from rpms_scraper import project

def run_scrapers():
    scrape_tsa.scrape()#Updatees on weekdays at 6
    scrape_covid.scrape()#Updated daily
    scrape_claims.scrape()#Updates on saturdays
    scrape_unemployment.scrape()#updates ~ first week of the month
    scrape_nonfarm.scrape()#updates ~ first week of the month
    scrape_covid_projections.scrape()#updates everyday sometime around the morning
    scrape_rpms.scrape()#updates ~ second week of the month (3 month lag)
    project.update_prediction()#updates projections using data from unemoployment, nonfarm, and covid

schedule.every().day.at('06:10').do(run_scrapers)
#schedule.every().day.at('09:00').do(run_scrapers)
schedule.every().day.at('12:00').do(run_scrapers)
#schedule.every().day.at('14:40').do(run_scrapers)


while True:
    schedule.run_pending()
    time.sleep(1)
