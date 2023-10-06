from django.urls import path
from .views import get_predictions

urlpatterns = [
    path('get_predictions/', get_predictions, name='get_predictions'),
]
