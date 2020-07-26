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
    scrape_tsa.scrape()
    scrape_covid.scrape()
    scrape_claims.scrape()
    scrape_unemployment.scrape()
    scrape_nonfarm.scrape()
    scrape_covid_projections.scrape()
    scrape_rpms.scrape()
    project.update_prediction()


schedule.every().day.at('06:10').do(run_scrapers)
#schedule.every().day.at('10:27').do(run_scrapers)

while True:
    schedule.run_pending()
    time.sleep(1)
