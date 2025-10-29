from django.http import HttpResponse
from django.template import loader
from .models import Student

def members(request):
  mymembers = Student.objects.all().values()
  template = loader.get_template('all_members.html')
  context = {
    'mymembers': mymembers,
  }
  return HttpResponse(template.render(context, request))