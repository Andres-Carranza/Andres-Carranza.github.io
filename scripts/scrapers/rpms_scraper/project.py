import tensorflow as tf
from tensorflow import keras
import pandas as pd
import numpy as np
import math 
from datetime import datetime as dt

def apply_inverse(data):
    data['months-since-covid-19'] = 1/ data['months-since-covid-19'] ** 1
    data['months-since-9/11'] = 1 / data['months-since-9/11'] **2
    data = data.replace(math.inf,0)

    return data

def normalize_data(data):
    data = apply_inverse(data)
    
    for col in data.columns:
        data[col] = data[col] / max(max(data[col]),1)

    return data

def predict(features_data,model,max_rpms):
        
    features = {name:np.array(value) for name, value in features_data.items()}
        
    predictions = model.predict(features)
    results = pd.DataFrame()


    for i, prediction in enumerate(predictions):
        results.loc[i,'rpms'] = prediction[0] * max_rpms

    for i, row in results.iterrows():
        results.loc[i,'rpms'] = max(row['rpms'],0)
   
    return results



def predict_model(model_name,threshold):

    model = keras.models.load_model('rpms_scraper/models/{}'.format(model_name))

    prediction_data = normalize_data(pd.read_csv('rpms_scraper/prediction_features/{}.csv'.format(model_name)))
    
    prediction_data = prediction_data.drop(range(threshold, len(prediction_data)))
    
    max_rpms = 71230170772

    results = predict(prediction_data, model,max_rpms)

    return results 


def numberOfDays( y, m):
    leap = 0
    if y% 400 == 0:
        leap = 1
    elif y % 100 == 0:
        leap = 0
    elif y% 4 == 0:
        leap = 1
    if m==2:
        return 28 + leap
    list = [1,3,5,7,8,10,12]
    if m in list:
        return 31
    return 30

def load_data(model_name):
    prediction_data = pd.read_csv('rpms_scraper/prediction_features/{}.csv'.format(model_name))

    unemployment = pd.read_csv('unemployment_scraper/unemployment-data.csv')

    for i, row in unemployment.iterrows():
        if i < 6:
            continue
        if not np.isnan(row['actual'] ):
            prediction_data.loc[i-6,'unemployment-rate'] = row['actual']
        else:
            prediction_data.loc[i-6,'unemployment-rate'] = row['projected']


    nonfarm = pd.read_csv('nonfarm_scraper/nonfarm-data.csv')

    for i, row in nonfarm.iterrows():
        if i < 6:
            continue
        if not np.isnan(row['actual'] ):
            prediction_data.loc[i-6,'nonfarm-payroll'] = row['actual']
        else:
            prediction_data.loc[i-6,'nonfarm-payroll'] = row['projected']

    covid_daily = pd.read_csv('covid_scraper/covid-projections.csv')

    covid_monthly = pd.DataFrame(columns=['date','deaths','new-infected', 'current-infected'])

    scenarios = {'baseline':'mean','pessimistic':'upper','optimistic':'lower'}

    month_deaths = 0
    month_new = 0
    month_current = 0
    num_days = 0

    date = '7/2020'
    for i, row in covid_daily.iterrows():

        curr_date = row['date'].split('/')
        if  int(curr_date[0]) < 7 and curr_date[2] =='2020':
            continue
        curr_date = curr_date[0]+'/'+curr_date[2]

        if curr_date == date:

            if not np.isnan(row['actual_deaths']):
                month_deaths+= row['actual_deaths']
            else:
                month_deaths+=row['predicted_deaths_{}'.format(scenarios[model_name])]

            month_new+=row['predicted_new_infected_{}'.format(scenarios[model_name])]
            month_current+=row['predicted_current_infected_{}'.format(scenarios[model_name])]

            num_days+=1
        else:            
            covid_monthly.loc[len(covid_monthly)] = [date,month_deaths/num_days,month_new/num_days,month_current/num_days]

            date = curr_date

            if not np.isnan(row['actual_deaths']):
                month_deaths= row['actual_deaths']
            else:
                month_deaths=row['predicted_deaths_{}'.format(scenarios[model_name])]

            month_new=row['predicted_new_infected_{}'.format(scenarios[model_name])]
            month_current=row['predicted_current_infected_{}'.format(scenarios[model_name])]
            
            num_days = 1

    days_month = numberOfDays(int(date.split('/')[1]),int(date.split('/')[0]))

    if num_days == days_month:
        covid_monthly.loc[len(covid_monthly)] = [date,month_deaths/num_days,month_new/num_days,month_current/num_days]

    for i, row in covid_monthly.iterrows():
        prediction_data.loc[i,['deaths', 'new-infected','current-infected']] = row

    threshold = len(prediction_data)

    for i,row in prediction_data.iterrows():
        for item in row.iteritems():
            if np.isnan(item[1]):
                threshold = i
                break
        if threshold == i:
            break
    prediction_data.to_csv('rpms_scraper/prediction_features/{}.csv'.format(model_name), index=False)

    return threshold

def update_prediction():
    name = 'Project'
    log = open('log.txt','a')
    log.write('({})\t\t\t{}:\t\tRunning script\n'.format(name,dt.now()))

    model_name = 'baseline'

    log.write('({})\t\t\t{}:\t\tLoading data...\n'.format(name,dt.now()))

    threshold = load_data(model_name)

    log.write('({})\t\t\t{}:\t\tMaking predictions..\n'.format(name,dt.now()))

    predictions = predict_model(model_name, threshold)
    
    rpms = pd.read_csv('rpms_scraper/rpms-data.csv')

    now = dt.now()
    now = str(now).split(' ')[0]
    now  = int(now[1]) +int(now[0]) *12

    for i,row in predictions.iterrows():
        dte =   i + 7 + 2020 * 12

        if now > dte:
            rpms.loc[i + 6, 'Actual'] = row['rpms']

        if np.isnan(rpms.loc[i+6,'Actual'] ):
            rpms.loc[i+6,'Baseline'] = row['rpms']
    last = 0

    for i, row in rpms.iterrows():
        if not np.isnan(row['Actual'] ):
            last = i
        else:
            break

        rpms.loc[i, 'Baseline'] = ''


    rpms.loc[last,'Baseline'] = rpms.loc[last,'Actual']


    log.write('({})\t\t\t{}:\t\tWriting predictions to csv...\n'.format(name,dt.now()))

    rpms.to_csv('rpms_scraper/rpms-data.csv',index = False)

    log.write('({})\t\t\t{}:\t\tScript finished\n'.format(name,dt.now()))

    log.close()


