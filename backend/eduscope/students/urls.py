from django.urls import path
from . import views

urlpatterns = [
    path('', views.members, name='members'),
    # path('/all_members/', views.all_members, name='all_members'),
]
