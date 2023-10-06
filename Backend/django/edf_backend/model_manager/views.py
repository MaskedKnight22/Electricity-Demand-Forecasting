import io
import boto3
import logging
import pandas as pd
from model_manager import train
from django.http import JsonResponse
from sklearn.preprocessing import MinMaxScaler
from django.views.decorators.csrf import csrf_exempt


"""
Delete the following code (was done only for testing the functions):
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edf_backend.settings')
django.setup()



# AWS Credentials
AWS_ACCESS = 'AKIA3OQDEGY5IF2353GU'
AWS_SECRET_ACCESS = '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'
# File Paths
BUCKET = 'electricitydemandforecasting'

# Set up logging
logging.basicConfig(level=logging.ERROR)

class SingletonType(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(SingletonType, cls).__call__(*args, **kwargs)
        return cls._instances[cls]

class ModelLoader(metaclass=SingletonType):
    def __init__(self):
        self.model = None

    def load_model(self):
        if self.model is None:
            self.model = train.load_model()
        return self.model

@csrf_exempt
def get_predictions(request):
    # 1. Load the current model
    model_loader = ModelLoader()
    model = model_loader.load_model()


    # 2. Initiate the S3 client and load persistent min-max values
    s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS, aws_secret_access_key=AWS_SECRET_ACCESS)
    min_max_values = load_min_max_values(s3)

    # 3. Pull the latest forecast.csv, actuals.csv and preds.csv from S3
    df_forecast = fetch_s3_data(s3, 'Data/forecasts.csv')
    df_actuals = fetch_s3_data(s3, 'Data/actuals.csv')
    df_preds = fetch_s3_data(s3, 'Data/preds.csv')

    # 4. Normalize both forecast and actuals using the persistent scaler
    # For forecasts
    df_forecast['Time'] = pd.to_datetime(df_forecast['Time'], dayfirst=True)
    df_forecast_to_normalize = df_forecast[df_forecast['Time'] > get_last_prediction_timestamp(df_preds)]
    df_forecast_to_normalize = normalize_data_using_persistent_scaler(df_forecast_to_normalize, min_max_values)
    df_forecast.update(df_forecast_to_normalize)

    # For actuals
    last_normalized_date_actuals = get_last_normalized_date(s3, 'Data/last_normalized_date_actuals.txt')
    df_actuals['Time'] = pd.to_datetime(df_actuals['Time'], dayfirst=True)
    df_actuals_to_normalize = df_actuals[df_actuals['Time'] > str(last_normalized_date_actuals)]
    df_actuals_to_normalize = normalize_data_using_persistent_scaler(df_actuals_to_normalize, min_max_values)
    df_actuals.update(df_actuals_to_normalize)
    set_last_normalized_date(s3, df_actuals['Time'].iloc[-1], 'Data/last_normalized_date_actuals.txt')

    # 5. Get the last prediction timestamp from df_forecast
    last_timestamp = get_last_prediction_timestamp(df_preds)
    missing_dates = df_forecast[df_forecast['Time'] > str(last_timestamp)]

    if not missing_dates.empty:
        # Make predictions using the model
        predictions = forecast_with_model(model, missing_dates)

        # Update preds.csv with new predictions
        df_preds = df_preds.append(predictions, ignore_index=True)
        save_df_to_s3(df_preds, s3, 'Data/preds.csv')

    # 6. Get last 7 days (168 hours) worth of data from forecasts.csv
    df_forecast_tail = df_forecast.tail(168)
    df_actuals_tail = df_actuals[df_actuals['Time'].isin(df_forecast_tail['Time'])] # filter to get data corresponding to the forecast's dates
    df_preds_tail = df_preds.tail(168)

    # 7. Format data and return as response
    response_data = {
        "forecast": df_forecast_tail.to_dict(orient='records'),
        "actuals": df_actuals_tail.to_dict(orient='records'),
        "preds": df_preds_tail.to_dict(orient='records')
    }
    
    return JsonResponse(response_data)

def forecast_with_model(model, df_forecast):
    future_data = model.make_future_dataframe(periods=len(df_forecast), freq='H')
    future_data = df_forecast[['ds', 'Cloud Cover (%)', 'Pressure_kpa', 'Temperature (C) ', 'Wind Direction (deg)', 'Wind Speed (kmh)']]
    
    # Generate forecast data
    forecast_data = model.predict(future_data)
    forecast_result = forecast_data[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]

    return forecast_result

def get_last_prediction_timestamp(df_preds):
    """Get the last prediction timestamp from the forecast dataframe."""
    return pd.to_datetime(df_preds['Time'].iloc[-1], dayfirst=True)

def fetch_s3_data(s3, key):
    """Fetch data from S3 and return a DataFrame."""
    try:
        obj = s3.get_object(Bucket=BUCKET, Key=key)
        return pd.read_csv(io.BytesIO(obj['Body'].read()))
    except Exception as e:
        logging.error(f"Failed to fetch data from S3 for key {key}. Error: {e}")
        raise

def save_df_to_s3(df, s3, file_path):
    """Save a DataFrame to S3."""
    try:
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        s3.put_object(Bucket=BUCKET, Key=file_path, Body=csv_buffer.getvalue())
    except Exception as e:
        logging.error(f"Failed to save DataFrame to S3 at {file_path}. Error: {e}")
        raise

def load_min_max_values(s3):
    """Load min-max normalization values from S3."""
    try:
        obj = s3.get_object(Bucket=BUCKET, Key='Data/min_max_values.csv')
        df_min_max = pd.read_csv(io.BytesIO(obj['Body'].read()))
        return df_min_max.set_index('Column').T.to_dict('list')
    except Exception as e:
        logging.error(f"Failed to load min-max values from S3. Error: {e}")
        raise

def normalize_data_using_persistent_scaler(df, min_max_values):
    for column in df.columns:
        if column in min_max_values:
            min_val, max_val = min_max_values[column]
            df[column] = (df[column] - min_val) / (max_val - min_val)
    return df

def get_last_normalized_date(s3, key):
    try:
        obj = s3.get_object(Bucket=BUCKET, Key=key)
        last_normalized_date = pd.to_datetime(obj['Body'].read().decode('utf-8').strip(), dayfirst=False)
        return last_normalized_date
    except Exception as e:
        # Log the error
        logging.error(f"Error fetching last normalized date from {key}. Error: {e}")
        # Return a default date way in the past if the file doesn't exist yet.
        return pd.to_datetime('15/01/2021 23:00', dayfirst=True)

def set_last_normalized_date(s3, last_normalized_date, key):
    """Set the last normalized date in S3."""
    try:
        s3.put_object(Bucket=BUCKET, Key=key, Body=str(last_normalized_date))
    except Exception as e:
        logging.error(f"Failed to set last normalized date in S3 for key {key}. Error: {e}")
        raise


"""
Delete the following code (was done only for testing the functions):
"""
if __name__ == '__main__':
    # Mock any necessary data or context
    request = None  # Replace this with any mocked request object or data your function needs

    # Call the function
    result = get_predictions(request)
    print(result)