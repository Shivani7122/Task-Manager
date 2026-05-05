from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView

from core.views import *

urlpatterns = [
    path("admin/", admin.site.urls),

    # 🔐 Auth
    path("api/login/", TokenObtainPairView.as_view(), name="login"),

    # 👥 Users
    path("api/users/", UserListView.as_view()),

    # 📦 Projects
    path("api/projects/", ProjectListView.as_view()),
    path("api/create-project/", ProjectCreateView.as_view()),

    # 📝 Tasks
    path("api/tasks/", TaskListView.as_view()),
    path("api/create-task/", TaskCreateView.as_view()),
    path("api/update-task/<int:pk>/", TaskUpdateView.as_view()),
    path('api/delete-task/<int:pk>/', TaskDeleteView.as_view()),
    path('api/delete-project/<int:pk>/', ProjectDeleteView.as_view()),

    # 📊 Dashboard
    path("api/dashboard/", DashboardView.as_view()),
]