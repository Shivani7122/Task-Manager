from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView

from core.views import (
    ProjectCreateView,
    ProjectListView,
    ProjectDeleteView,
    TaskCreateView,
    TaskUpdateView,
    TaskDeleteView,
    TaskListView,
    UserListView,
    DashboardView,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # 🔐 Auth
    path("api/auth/login/", TokenObtainPairView.as_view(), name="login"),

    # 👥 Users
    path("api/users/", UserListView.as_view()),

    # 📦 Projects
    path("api/projects/", ProjectListView.as_view()),
    path("api/projects/create/", ProjectCreateView.as_view()),
    path("api/projects/<int:pk>/delete/", ProjectDeleteView.as_view()),

    # 📝 Tasks
    path("api/tasks/", TaskListView.as_view()),
    path("api/tasks/create/", TaskCreateView.as_view()),
    path("api/tasks/<int:pk>/update/", TaskUpdateView.as_view()),
    path("api/tasks/<int:pk>/delete/", TaskDeleteView.as_view()),

    # 📊 Dashboard
    path("api/dashboard/", DashboardView.as_view()),
]