from rest_framework import viewsets, parsers
from .models import Application, Applicant
from .serializers import ApplicantSerializer, ApplicationSerializer

class ApplicantViewSet(viewsets.ModelViewSet):
    queryset = Applicant.objects.all().order_by("id")
    serializer_class = ApplicantSerializer

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all().order_by("id")
    serializer_class = ApplicationSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]