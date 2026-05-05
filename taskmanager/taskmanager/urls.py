from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView

from core.views import (
    ProjectCreateView,
    ProjectListView,
    TaskCreateView,
    TaskUpdateView,
    TaskListView,
    UserListView,
    DashboardView,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # 🔐 Auth
    path("api/auth/login/", TokenObtainPairView.as_view(), name="login"),

    # 👥 Users
    path("api/users/", UserListView.as_view(), name="user-list"),

    # 📦 Projects
    path("api/projects/", ProjectListView.as_view(), name="project-list"),
    path("api/projects/create/", ProjectCreateView.as_view(), name="project-create"),

    # 📝 Tasks
    path("api/tasks/", TaskListView.as_view(), name="task-list"),
    path("api/tasks/create/", TaskCreateView.as_view(), name="task-create"),
    path("api/tasks/<int:pk>/update/", TaskUpdateView.as_view(), name="task-update"),

    # 📊 Dashboard
    path("api/dashboard/", DashboardView.as_view(), name="dashboard"),
]