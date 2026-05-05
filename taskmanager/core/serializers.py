from rest_framework import serializers
from .models import User, Project, Task


# 🔹 User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_active', 'is_superuser']


# 🔹 Project Serializer
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


# 🔹 Task Serializer
class TaskSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())
    assigned_to_username = serializers.ReadOnlyField(source='assigned_to.username')
    project_title = serializers.ReadOnlyField(source='project.title')
    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'status',
            'assigned_to',
            'assigned_to_username',
            'project',
            'project_title',
            'deadline'
        ]