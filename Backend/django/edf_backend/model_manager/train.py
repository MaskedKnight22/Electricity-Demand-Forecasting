import os
import boto3
import pickle
import numpy as np
import pandas as pd
from prophet import Prophet
from smart_open import smart_open
from sklearn.preprocessing import MinMaxScaler

# AWS Credentials
AWS_ACCESS = 'AKIA3OQDEGY5IF2353GU'
AWS_SECRET_ACCESS = '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'

# Initializing S3 client
s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS, aws_secret_access_key=AWS_SECRET_ACCESS)

# File Paths
BUCKET = 'electricitydemandforecasting'
FILE1 = 'Data/data_for_analysis/actuals_1.csv'
FILE2 = 'Data/data_for_analysis/actuals_2.csv'
FILE3 = 'Data/Forecast_Data/forecasts.csv'
FILE4 = 'Data/Forecast_Data/Forecasts_part2.csv'
PATH1 = f's3://{AWS_ACCESS}:{AWS_SECRET_ACCESS}@{BUCKET}/{FILE1}'
PATH2 = f's3://{AWS_ACCESS}:{AWS_SECRET_ACCESS}@{BUCKET}/{FILE2}'
PATH3 = f's3://{AWS_ACCESS}:{AWS_SECRET_ACCESS}@{BUCKET}/{FILE3}'
PATH4 = f's3://{AWS_ACCESS}:{AWS_SECRET_ACCESS}@{BUCKET}/{FILE4}'

def load_data():
    df1 = pd.read_csv(smart_open(PATH1))
    df2 = pd.read_csv(smart_open(PATH2))
    df_train = pd.concat([df1, df2], axis=0)
    df_train['Time'] = pd.to_datetime(df_train['Time'], dayfirst=True)

    df_test_1 = pd.read_csv(smart_open(PATH3))
    df_test_2 = pd.read_csv(smart_open(PATH4))
    df_test = pd.concat([df_test_1, df_test_2], axis=0)
    df_test['Time'] = pd.to_datetime(df_test['Time'], dayfirst=True)

    return df_train, df_test

def preprocess_data(df_train, df_test):
    # Handle missing values (assuming the rest of the code you provided does that)
    x = np.where(pd.isnull(df_test))
    for i in range(len(x[0])):
        if x[1][i] == 0:
            ts = df_test.iloc[x[0][i] - 1, 0]
            new_ts = ts + pd.Timedelta(hours=1)
            df_test.iloc[x[0][i], x[1][i]] = new_ts
        else:
            temp = 0
            for j in range(10, 0, -1):
                temp += df_test.iloc[x[0][i] - j, x[1][i]]
            average = temp / 10
            df_test.iloc[x[0][i], x[1][i]] = average

    # Normalize features
    scaler = MinMaxScaler()
    feature_columns = ['Load (kW)', 'Pressure_kpa', 'Cloud Cover (%)', 'Humidity (%)', 'Temperature (C) ', 'Wind Direction (deg)', 'Wind Speed (kmh)']
    feature_columns_forecast = ['Cloud Cover (%)', 'Pressure_kpa', 'Temperature (C) ', 'Wind Direction (deg)', 'Wind Speed (kmh)']
    for column in feature_columns:
        df_train[column] = scaler.fit_transform(df_train[[column]])
    for column in feature_columns_forecast:
        df_test[column] = scaler.fit_transform(df_test[[column]])

    df_train = df_train.rename(columns={'Load (kW)': 'y', 'Time': 'ds'})
    df_test = df_test.rename(columns={'Time': 'ds'})

    return df_train, df_test

def train_prophet_model(df_train):
    # Prophet Model Initialization with additional regressors
    model = Prophet()
    model.add_regressor('Cloud Cover (%)')
    model.add_regressor('Pressure_kpa')
    model.add_regressor('Temperature (C) ')
    model.add_regressor('Wind Direction (deg)')
    model.add_regressor('Wind Speed (kmh)')

    # Train the model using the training data
    model.fit(df_train.iloc[:-48])

    # Save the trained model
    save_model(model)

    return model

def forecast_with_model(model, df_train, df_test):
    # Prepare the data for forecasting
    df = pd.concat([df_train.iloc[:-48], df_test.tail(48)])
    future_data = model.make_future_dataframe(periods=48, freq='H')
    future_data = df[['ds', 'Cloud Cover (%)', 'Pressure_kpa', 'Temperature (C) ', 'Wind Direction (deg)', 'Wind Speed (kmh)']]
    
    # Generate forecast data
    forecast_data = model.predict(future_data)
    forecast_result = forecast_data[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]

    return forecast_result

def save_model(model):
    # First, rename the current model (if it exists) to prophet_model_previous.pkl
    current_model_path = 'model_manager/trained_models/prophet_model_current.pkl'
    previous_model_path = 'model_manager/trained_models/prophet_model_previous.pkl'
    
    if os.path.exists(current_model_path):
        if os.path.exists(previous_model_path):
            os.remove(previous_model_path)  # delete the old previous model
        os.rename(current_model_path, previous_model_path)  # rename current to previous

    # Save the new model
    with open(current_model_path, 'wb') as f:
        pickle.dump(model, f)

def load_model(current=True):
    """Load the model from disk.
    
    Args:
    - current (bool): Whether to load the current or the previous model.
    
    Returns:
    - model: The loaded Prophet model.
    """
    filename = 'prophet_model_current.pkl' if current else 'prophet_model_previous.pkl'
    path = f'model_manager/trained_models/{filename}'
    
    with open(path, 'rb') as f:
        model = pickle.load(f)
    
    return model

if __name__ == "__main__":
    # Load the data
    df_train, df_test = load_data()

    # Preprocess the data
    df_train, df_test = preprocess_data(df_train, df_test)

    # Train the Prophet model
    model = train_prophet_model(df_train)

    # Generate forecasts
    forecast_result = forecast_with_model(model, df_train, df_test)
    print(forecast_result)