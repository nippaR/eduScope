from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicantViewSet, ApplicationViewSet

router = DefaultRouter()
router.register(r'Applicant', ApplicantViewSet, basename='Applicant')
router.register(r'Application', ApplicationViewSet, basename='Application')

urlpatterns = [
    path('', include(router.urls)),
]
