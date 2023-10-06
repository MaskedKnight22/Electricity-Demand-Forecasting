import unittest
from unittest.mock import MagicMock, patch
import pandas as pd
import boto3
from io import BytesIO

"""
Written by: Nathan
Last Edited: 05/10/2023
"""

from model_manager.views import fetch_s3_data, save_df_to_s3, normalize_data_using_persistent_scaler

class ForecastingTests(unittest.TestCase):

    # Mock the S3 client and response
    @patch('model_manager.boto3.client')
    def test_fetch_s3_data(self, mock_client):
        mock_s3_response = {
            'Body': BytesIO(b'Time,Value\n2022-01-01 00:00,100')
        }
        mock_client.return_value.get_object.return_value = mock_s3_response

        expected_output = pd.DataFrame({
            'Time': ['2022-01-01 00:00'],
            'Value': [100]
        })
        
        actual_output = fetch_s3_data('Data/forecasts.csv')
        pd.testing.assert_frame_equal(expected_output, actual_output)


    @patch('model_manager.boto3.client')
    def test_save_df_to_s3(self, mock_client):
        df = pd.DataFrame({
            'Time': ['2022-01-01 00:00'],
            'Value': [100]
        })

        # Assuming there's no exception, this means our function has worked as expected.
        # The mock ensures that we don't actually call AWS.
        save_df_to_s3(df, 'Data/test.csv')

    def test_normalize_data_using_persistent_scaler(self):
        df = pd.DataFrame({
            'Time': ['2022-01-01 00:00', '2022-01-02 00:00'],
            'Value': [50, 150]
        })

        min_max_values = {
            'Value': [0, 200]
        }

        expected_output = pd.DataFrame({
            'Time': ['2022-01-01 00:00', '2022-01-02 00:00'],
            'Value': [0.25, 0.75]
        })

        actual_output = normalize_data_using_persistent_scaler(df, min_max_values)
        pd.testing.assert_frame_equal(expected_output, actual_output)

# Run the tests
if __name__ == '__main__':
    unittest.main()