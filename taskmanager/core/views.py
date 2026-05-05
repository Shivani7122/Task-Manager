from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.hashers import make_password
from .models import Project, Task, User
from .serializers import ProjectSerializer, TaskSerializer, UserSerializer
from datetime import date
from rest_framework import generics
from .models import Project
from .serializers import ProjectSerializer


# ================= PROJECT =================

class ProjectCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "admin":
            return Response({"error": "Only admin can create project"}, status=403)

        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
           from .models import User
           created_by_id = request.data.get("created_by")
           user = User.objects.get(id=created_by_id)
           serializer.save(created_by=user)
           return Response(serializer.data)

        return Response(serializer.errors, status=400)


class ProjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role == "admin":
            projects = Project.objects.all()
        else:
            projects = Project.objects.filter(task__assigned_to=request.user).distinct()

        return Response(ProjectSerializer(projects, many=True).data)


class ProjectDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != "admin":
            return Response({"error": "Only admin can delete project"}, status=403)

        try:
            project = Project.objects.get(id=pk)
            project.delete()
            return Response({"message": "Project deleted"})
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=404)


# ================= TASK =================

class TaskCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "admin":
            return Response({"error": "Only admin can assign tasks"}, status=403)

        try:
            assigned_user = User.objects.get(id=request.data.get("assigned_to"))
            project = Project.objects.get(id=request.data.get("project"))
        except:
            return Response({"error": "Invalid user or project"}, status=400)

        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                assigned_to=assigned_user,
                project=project
            )
            return Response(serializer.data)

        return Response(serializer.errors, status=400)


class TaskListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == "admin":
            tasks = Task.objects.all()
        else:
            tasks = Task.objects.filter(assigned_to=request.user)

        return Response(TaskSerializer(tasks, many=True).data)


class TaskUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            task = Task.objects.get(id=pk)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=404)

        # member → only own task
        if request.user != task.assigned_to and request.user.role != "admin":
            return Response({"error": "Not allowed"}, status=403)

        new_status = request.data.get("status")

        if new_status not in ["pending", "in_progress", "done"]:
            return Response({"error": "Invalid status"}, status=400)

        task.status = new_status
        task.save()

        return Response({"message": "Task updated"})


class TaskDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != "admin":
            return Response({"error": "Only admin can delete task"}, status=403)

        try:
            task = Task.objects.get(id=pk)
            task.delete()
            return Response({"message": "Task deleted"})
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=404)


# ================= USERS =================

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all()
        return Response(UserSerializer(users, many=True).data)


class UserCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "admin":
            return Response({"error": "Only admin can create users"}, status=403)

        data = request.data

        if User.objects.filter(username=data.get("username")).exists():
            return Response({"error": "Username already exists"}, status=400)

        user = User.objects.create(
            username=data.get("username"),
            password=make_password(data.get("password")),
            role=data.get("role", "member"),
            is_superuser=data.get("is_superuser", False),
            is_active=data.get("is_active", True),
            is_staff=True
        )

        return Response({"message": "User created"})


class UserUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        if request.user.role != "admin":
            return Response({"error": "Only admin can update users"}, status=403)

        try:
            user = User.objects.get(id=pk)
        except:
            return Response({"error": "User not found"}, status=404)

        user.role = request.data.get("role", user.role)
        user.is_superuser = request.data.get("is_superuser", user.is_superuser)
        user.is_active = request.data.get("is_active", user.is_active)

        # optional password update
        if request.data.get("password"):
            user.password = make_password(request.data.get("password"))

        user.save()

        return Response({"message": "User updated"})


class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != "admin":
            return Response({"error": "Only admin can delete users"}, status=403)

        try:
            user = User.objects.get(id=pk)
            user.delete()
            return Response({"message": "User deleted"})
        except:
            return Response({"error": "User not found"}, status=404)


# ================= DASHBOARD =================

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role == "admin":
            tasks = Task.objects.all()
        else:
            tasks = Task.objects.filter(assigned_to=request.user)

        return Response({
            "total_tasks": tasks.count(),
            "completed_tasks": tasks.filter(status="done").count(),
            "pending_tasks": tasks.filter(status="pending").count(),
            "overdue_tasks": tasks.filter(deadline__lt=date.today()).exclude(status="done").count()
        })