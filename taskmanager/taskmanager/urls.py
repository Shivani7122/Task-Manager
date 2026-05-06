from django.contrib import admin
from django.urls import path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)

from core.views import (

    # USERS
    UserListView,
    UserCreateView,
    UserDeleteView,

    # PROJECTS
    ProjectListView,
    ProjectCreateView,
    ProjectDeleteView,

    # TASKS
    TaskListView,
    TaskCreateView,
    TaskUpdateView,
    TaskDeleteView,
)

urlpatterns = [

    path('admin/', admin.site.urls),

    # LOGIN
    path(
        'api/auth/login/',
        TokenObtainPairView.as_view()
    ),

    # USERS
    path(
        'api/users/',
        UserListView.as_view()
    ),

    path(
        'api/users/create/',
        UserCreateView.as_view()
    ),

    path(
        'api/users/delete/<int:pk>/',
        UserDeleteView.as_view()
    ),

    # PROJECTS
    path(
        'api/projects/',
        ProjectListView.as_view()
    ),

    path(
        'api/projects/create/',
        ProjectCreateView.as_view()
    ),

    path(
        'api/projects/delete/<int:pk>/',
        ProjectDeleteView.as_view()
    ),

    # TASKS
    path(
        'api/tasks/',
        TaskListView.as_view()
    ),

    path(
        'api/tasks/create/',
        TaskCreateView.as_view()
    ),

    path(
        'api/tasks/update/<int:pk>/',
        TaskUpdateView.as_view()
    ),

    path(
        'api/tasks/delete/<int:pk>/',
        TaskDeleteView.as_view()
    ),
]