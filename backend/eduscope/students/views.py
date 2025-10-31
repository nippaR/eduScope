from rest_framework import viewsets, parsers
from .models import Application, Applicant
from .serializers import ApplicantSerializer

class ApplicantViewSet(viewsets.ModelViewSet):
    queryset = Applicant.objects.all().order_by("id")
    serializer_class = ApplicantSerializer
