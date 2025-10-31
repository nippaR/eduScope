from rest_framework import serializers
from .models import Application,Applicant

class ApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Applicant
        fields = [
            "id",
            "first_name",
            "last_name",
            "gender",
            "dob",
            "guardian_name",
            "email",
            "phone",
            "address",
            "created_at",
            "updated_at",
        ]
