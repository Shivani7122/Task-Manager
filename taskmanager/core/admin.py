from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Project, Task


# 🔹 Custom User Admin
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')


# 🔹 Project Admin
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_by')


# 🔹 Task Admin
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'status', 'assigned_to')