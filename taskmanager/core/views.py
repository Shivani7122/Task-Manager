from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer


# 🔹 Create Project (Admin only)
class ProjectCreateView(APIView):
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
    def post(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Only admin can assign tasks"}, status=403)

        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)


# 🔹 Update Task (Member)
class TaskUpdateView(APIView):
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


# 🔹 Get Tasks
class TaskListView(APIView):
    def get(self, request):
        if request.user.role == 'admin':
            tasks = Task.objects.all()
        else:
            tasks = Task.objects.filter(assigned_to=request.user)

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)