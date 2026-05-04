# Task Manager

## Overview
Role-based task management app with Admin/Member access.  
Admin can create projects and assign tasks; members update their own tasks.  
Includes dashboard analytics.

---

## Tech Stack
- Backend: Django, Django REST Framework
- Authentication: JWT (SimpleJWT) + Session (browser)
- Database: MySQL
- Development: GitHub Codespaces

---

## Features
- User Login (JWT Authentication)
- Project creation (Admin only)
- Task assignment (Admin only)
- Task update (Assigned member only)
- Role-based task listing
- Dashboard analytics:
  - Total tasks
  - Completed tasks
  - Pending tasks
  - Overdue tasks

---

## API Endpoints

| Method | Endpoint | Description |
|--------|--------|-------------|
| POST | `/login/` | Get JWT token |
| POST | `/create-project/` | Create project (Admin) |
| POST | `/create-task/` | Create task (Admin) |
| PUT | `/update-task/<id>/` | Update task (Member) |
| GET | `/tasks/` | List tasks (Role-based) |
| GET | `/dashboard/` | Dashboard analytics |

---

## Authentication

Use JWT token in request headers:

Example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc3ODk3NTY4LCJpYXQiOjE3Nzc4OTM5NjgsImp0aSI6ImIzYWJmMmZhMDAyNjQ0Zjg4M2VkOTkyYWM5MTgwOTNhIiwidXNlcl9pZCI6IjEifQ.fqKEPEVn6jtxhLW6P-YslvJT2uH0Br1U-MoG8RSHsb0"


---

## Run Locally

```bash
git clone <your-repo-link>
cd Task-Manager
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver