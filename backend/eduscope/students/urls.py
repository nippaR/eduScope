from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicantViewSet

router = DefaultRouter()
router.register(r'Applicant', ApplicantViewSet, basename='Applicant')

urlpatterns = [
    path('', include(router.urls)),
]
