from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer
from datetime import date


# 🔹 Create Project (Admin only)
class ProjectCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Only admin can create project"}, status=403)

        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data)

        return Response(serializer.errors, status=400)


# 🔹 Create Task (Admin only)
class TaskCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Only admin can assign tasks"}, status=403)

        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

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

        task.status = request.data.get('status')
        task.save()

        return Response({"message": "Task updated"})


# 🔹 Get Tasks (Admin = all, Member = own)
class TaskListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'admin':
            tasks = Task.objects.all()
        else:
            tasks = Task.objects.filter(assigned_to=request.user)

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tasks = Task.objects.all()

        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='done').count()
        pending_tasks = tasks.filter(status='pending').count()
        overdue_tasks = tasks.filter(deadline__lt=date.today()).exclude(status='done').count()

        return Response({
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "overdue_tasks": overdue_tasks
        })