from django.contrib import admin
from .models import User, Project, Task

# Register models
admin.site.register(User)
admin.site.register(Project)
admin.site.register(Task)