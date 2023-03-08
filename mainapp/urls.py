from django.urls import path
from .views import signin, main

urlpatterns = [
	path('sign-in/', signin),
	path('main/', main),
]