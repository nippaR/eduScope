from django.contrib import admin
from .models import Applicant, Application

@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "phone", "created_at")
    search_fields = ("first_name", "last_name", "email", "phone")

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("applicant", "apply_grade", "status", "submitted_at")
    list_filter = ("status", "apply_grade")
    search_fields = ("applicant__first_name", "applicant__last_name", "status")
