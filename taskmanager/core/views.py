from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Project, Task, User
from .serializers import ProjectSerializer, TaskSerializer, UserSerializer
from datetime import date


# 🔹 Create Project (Admin only)
class ProjectCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Only admin can create project"}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 🔹 Get Projects
class ProjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.all()
        return Response(ProjectSerializer(projects, many=True).data)


# 🔹 Create Task (Admin only)
class TaskCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Only admin can assign tasks"}, status=status.HTTP_403_FORBIDDEN)

        assigned_to = request.data.get("assigned_to")
        project_id = request.data.get("project")

        try:
            assigned_user = User.objects.get(id=assigned_to)
            project = Project.objects.get(id=project_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=400)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=400)

        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(assigned_to=assigned_user, project=project)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)


# 🔹 Update Task (Member only)
class TaskUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            task = Task.objects.get(id=pk)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=404)

        if request.user != task.assigned_to:
            return Response({"error": "Not allowed"}, status=403)

        new_status = request.data.get("status")

        valid_status = dict(Task.STATUS_CHOICES).keys()
        if new_status not in valid_status:
            return Response({"error": "Invalid status"}, status=400)

        task.status = new_status
        task.save()

        return Response({"message": "Task updated"})


# 🔹 Get Tasks
class TaskListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'admin':
            tasks = Task.objects.all()
        else:
            tasks = Task.objects.filter(assigned_to=request.user)

        return Response(TaskSerializer(tasks, many=True).data)


# 🔹 Dashboard
class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'admin':
            tasks = Task.objects.all()
        else:
            tasks = Task.objects.filter(assigned_to=request.user)

        return Response({
            "total_tasks": tasks.count(),
            "completed_tasks": tasks.filter(status='done').count(),
            "pending_tasks": tasks.filter(status='pending').count(),
            "overdue_tasks": tasks.filter(deadline__lt=date.today()).exclude(status='done').count()
        })


# 🔹 Users API (Dropdown)
class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all()
        return Response(UserSerializer(users, many=True).data)