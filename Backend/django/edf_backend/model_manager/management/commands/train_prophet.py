from django.core.management.base import BaseCommand
from model_manager import train

class Command(BaseCommand):
    help = 'Trains the Prophet forecasting model'

    def handle(self, *args, **kwargs):
        # Load the data
        df_train, df_test = train.load_data()

        # Preprocess the data
        df_train, df_test = train.preprocess_data(df_train, df_test)

        # Train the Prophet model
        model = train.train_prophet_model(df_train)

        # Generate forecasts
        forecast_result = train.forecast_with_model(model, df_train, df_test)
        self.stdout.write(self.style.SUCCESS('Model trained successfully!'))
