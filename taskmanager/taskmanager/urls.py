from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView

from core.views import (
    # PROJECT
    ProjectCreateView,
    ProjectListView,
    ProjectDeleteView,

    # TASK
    TaskCreateView,
    TaskUpdateView,
    TaskDeleteView,
    TaskListView,

    # USERS
    UserListView,
    UserCreateView,
    UserUpdateView,
    UserDeleteView,

    # DASHBOARD
    DashboardView,
)

urlpatterns = [

    # ================= ADMIN PANEL =================
    path("admin/", admin.site.urls),

    # ================= AUTH =================
    path("api/auth/login/", TokenObtainPairView.as_view(), name="login"),

    # ================= USERS =================
    path("api/users/", UserListView.as_view()),
    path("api/users/create/", UserCreateView.as_view()),
    path("api/users/<int:pk>/update/", UserUpdateView.as_view()),
    path("api/users/<int:pk>/delete/", UserDeleteView.as_view()),

    # ================= PROJECT =================
    path("api/projects/", ProjectListView.as_view()),
    path("api/projects/create/", ProjectCreateView.as_view()),
    path("api/projects/<int:pk>/delete/", ProjectDeleteView.as_view()),

    # ================= TASK =================
    path("api/tasks/", TaskListView.as_view()),
    path("api/tasks/create/", TaskCreateView.as_view()),
    path("api/tasks/<int:pk>/update/", TaskUpdateView.as_view()),
    path("api/tasks/<int:pk>/delete/", TaskDeleteView.as_view()),

    # ================= DASHBOARD =================
    path("api/dashboard/", DashboardView.as_view()),
]