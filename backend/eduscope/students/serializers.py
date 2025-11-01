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

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            "id",
            "applicant",
            "apply_grade",
            "extra_curriculars",
            "photo",
            "birth_certificate",
            "health_record",
            "status",
            "submitted_at",
            "updated_at",
        ]

    def validate_extra_curriculars(self, value):
        # allow list or stringified JSON list
        if isinstance(value, str):
            import json
            try:
                value = json.loads(value)
            except Exception:
                raise serializers.ValidationError("extra_curriculars must be JSON array")
        return value