from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/chat/', views.chat_api, name='chat_api'),
    path('api/quote/', views.submit_quote, name='submit_quote'),
    path('api/contact/', views.contact_message, name='contact_message'),
]
