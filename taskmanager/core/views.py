from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import (
    User,
    Project,
    Task
)

from .serializers import (
    UserSerializer,
    ProjectSerializer,
    TaskSerializer
)

from .permissions import IsAdminRole


# ================= USERS =================

class UserListView(generics.ListAPIView):

    queryset = User.objects.all()

    serializer_class = UserSerializer

    permission_classes = [IsAuthenticated]


class UserCreateView(generics.CreateAPIView):

    serializer_class = UserSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminRole
    ]

    def perform_create(self, serializer):

        user = serializer.save()

        user.set_password(
            self.request.data.get("password")
        )

        user.save()


class UserDeleteView(generics.DestroyAPIView):

    queryset = User.objects.all()

    serializer_class = UserSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminRole
    ]


# ================= PROJECTS =================

class ProjectListView(generics.ListAPIView):

    queryset = Project.objects.all()

    serializer_class = ProjectSerializer

    permission_classes = [IsAuthenticated]


class ProjectCreateView(generics.CreateAPIView):

    queryset = Project.objects.all()

    serializer_class = ProjectSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminRole
    ]


class ProjectDeleteView(generics.DestroyAPIView):

    queryset = Project.objects.all()

    serializer_class = ProjectSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminRole
    ]


# ================= TASKS =================

class TaskListView(generics.ListAPIView):

    serializer_class = TaskSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.role == 'ADMIN':

            return Task.objects.all().order_by('-id')

        return Task.objects.filter(
            assigned_to=user
        ).order_by('-id')


class TaskCreateView(generics.CreateAPIView):

    queryset = Task.objects.all()

    serializer_class = TaskSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminRole
    ]


class TaskUpdateView(generics.UpdateAPIView):

    serializer_class = TaskSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.role == 'ADMIN':

            return Task.objects.all()

        return Task.objects.filter(
            assigned_to=user
        )


class TaskDeleteView(generics.DestroyAPIView):

    queryset = Task.objects.all()

    serializer_class = TaskSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminRole
    ]