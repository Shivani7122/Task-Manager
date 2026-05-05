"""
URL configuration for taskmanager project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from core.views import ProjectCreateView, TaskCreateView, TaskUpdateView, TaskListView
from rest_framework_simplejwt.views import TokenObtainPairView
from core.views import DashboardView

urlpatterns = [
    path("admin/", admin.site.urls),

    # 🔐 Auth
    path('api/login/', TokenObtainPairView.as_view(), name='login'),

    # 📦 Project & Task
    path('api/create-project/', ProjectCreateView.as_view()),
    path('api/create-task/', TaskCreateView.as_view()),
    path('api/update-task/<int:pk>/', TaskUpdateView.as_view()),
    path('api/tasks/', TaskListView.as_view()),

    # 📊 Dashboard
    path('api/dashboard/', DashboardView.as_view()),
]