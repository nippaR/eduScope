from django.db import models

class Student(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)


#Applicant Model

class Applicant(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    gender = models.CharField(max_length=10)
    dob = models.DateField(null=True, blank=True)
    guardian_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Application(models.Model):

    applicant = models.OneToOneField(
        Applicant,
        on_delete=models.CASCADE,
        related_name='application'
    )

    apply_grade = models.CharField(max_length=50)
    extra_curriculars = models.JSONField(null=True, blank=True)

    #File Upload Fields

    photo = models.ImageField(upload_to='photos/', null=True, blank=True)
    birth_certificate = models.FileField(upload_to='birth_certificates/', null=True, blank=True)
    health_record = models.FileField(upload_to='health_records/', null=True, blank=True)

    #application status fields
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    #Submitted at
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Application of {self.applicant.first_name} {self.applicant.last_name} for {self.status}"