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
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'