const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev";

/* ================= AUTH ================= */

function login() {
  const username = usernameInput.value;
  const password = passwordInput.value;
  const msg = document.getElementById("msg");

  fetch(`${API_URL}/api/auth/login/`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.access) {
      msg.innerText = "Invalid credentials";
      return;
    }

    localStorage.setItem("token", data.access);

    // 🔥 FETCH ROLE
    fetch(`${API_URL}/api/users/`, {
      headers: { Authorization: "Bearer " + data.access }
    })
    .then(res => res.json())
    .then(users => {
      const user = users.find(u => u.username === username);
      localStorage.setItem("role", user?.role || "member");
      window.location.href = "dashboard.html";
    });
  })
  .catch(() => msg.innerText = "Server error");
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + localStorage.getItem("token")
  };
}

function isAdmin() {
  return localStorage.getItem("role") === "admin";
}

/* ================= INIT ================= */

function initApp() {
  if (!localStorage.getItem("token")) {
    window.location.href = "index.html";
    return;
  }

  loadDashboard();
  loadTasks();
  loadProjects();
  loadUsers();
}

/* ================= USERS ================= */

function loadUsers() {
  if (!isAdmin()) return;

  fetch(`${API_URL}/api/users/`, { headers: getHeaders() })
  .then(res => res.json())
  .then(data => {
    usersList.innerHTML = "";

    data.forEach(u => {
      usersList.innerHTML += `
        <div class="card-item">
          <div>
            <b>${u.username}</b> (${u.role})
            <br>
            Active: ${u.is_active ? "Yes" : "No"} |
            Superuser: ${u.is_superuser ? "Yes" : "No"}
          </div>

          <div>
            <button onclick="editUser(${u.id}, '${u.role}', ${u.is_active}, ${u.is_superuser})">✏️</button>
            <button onclick="deleteUser(${u.id})">🗑</button>
          </div>
        </div>
      `;
    });
  });
}

function createUser() {
  if (!isAdmin()) return alert("Admin only");

  fetch(`${API_URL}/api/users/create/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      username: newUsername.value,
      password: newPassword.value,
      role: newRole.value,
      is_superuser: isSuperuser.checked,
      is_active: isActive.checked
    })
  })
  .then(() => {
    loadUsers();
    alert("User created");
  });
}

function deleteUser(id) {
  fetch(`${API_URL}/api/users/${id}/delete/`, {
    method: "DELETE",
    headers: getHeaders()
  }).then(() => loadUsers());
}

function editUser(id, role, active, superuser) {
  const newRoleVal = prompt("Role (admin/member)", role);
  const newActive = confirm("Active?");
  const newSuper = confirm("Superuser?");

  fetch(`${API_URL}/api/users/${id}/update/`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      role: newRoleVal,
      is_active: newActive,
      is_superuser: newSuper
    })
  }).then(() => loadUsers());
}

/* ================= PROJECT ================= */

function loadProjects() {
  fetch(`${API_URL}/api/projects/`, { headers: getHeaders() })
  .then(res => res.json())
  .then(data => {
    projectList.innerHTML = "";
    projectSelect.innerHTML = "";

    data.forEach(p => {
      projectList.innerHTML += `
        <div class="card-item">
          ${p.title}
          ${isAdmin() ? `<button onclick="deleteProject(${p.id})">🗑</button>` : ""}
        </div>
      `;

      projectSelect.innerHTML += `<option value="${p.id}">${p.title}</option>`;
    });
  });
}

function createProject() {
  if (!isAdmin()) return alert("Admin only");

  fetch(`${API_URL}/api/projects/create/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      title: projectTitle.value,
      description: projectDesc.value
    })
  }).then(loadProjects);
}

function deleteProject(id) {
  fetch(`${API_URL}/api/projects/${id}/delete/`, {
    method: "DELETE",
    headers: getHeaders()
  }).then(loadProjects);
}

/* ================= TASK ================= */

function loadTasks() {
  fetch(`${API_URL}/api/tasks/`, { headers: getHeaders() })
  .then(res => res.json())
  .then(tasks => {
    tasksDiv.innerHTML = "";

    tasks.forEach(t => {
      tasksDiv.innerHTML += `
        <div class="task-card">
          <h4>${t.title}</h4>
          <p>${t.description}</p>

          <small>👤 ${t.assigned_to_username}</small>
          <small>📦 ${t.project_title}</small>

          <div class="status ${t.status}">${t.status}</div>

          <div class="actions">
            <select onchange="updateTask(${t.id}, this.value)">
              <option ${t.status==='pending'?'selected':''} value="pending">Pending</option>
              <option ${t.status==='in_progress'?'selected':''} value="in_progress">In Progress</option>
              <option ${t.status==='done'?'selected':''} value="done">Done</option>
            </select>

            ${isAdmin() ? `<button onclick="deleteTask(${t.id})">🗑</button>` : ""}
          </div>
        </div>
      `;
    });
  });
}

function createTask() {
  if (!isAdmin()) return alert("Admin only");

  fetch(`${API_URL}/api/tasks/create/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      title: taskTitle.value,
      description: taskDesc.value,
      status: status.value,
      assigned_to: assignedUser.value,
      project: projectSelect.value,
      deadline: deadline.value
    })
  }).then(() => {
    loadTasks();
    loadDashboard();
  });
}

function updateTask(id, status) {
  fetch(`${API_URL}/api/tasks/${id}/update/`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ status })
  }).then(loadTasks);
}

function deleteTask(id) {
  fetch(`${API_URL}/api/tasks/${id}/delete/`, {
    method: "DELETE",
    headers: getHeaders()
  }).then(loadTasks);
}

/* ================= DASHBOARD ================= */

function loadDashboard() {
  fetch(`${API_URL}/api/dashboard/`, { headers: getHeaders() })
  .then(res => res.json())
  .then(d => {
    dashboard.innerHTML = `
      <div>Total: ${d.total_tasks}</div>
      <div>Completed: ${d.completed_tasks}</div>
      <div>Pending: ${d.pending_tasks}</div>
      <div>Overdue: ${d.overdue_tasks}</div>
    `;
  });
}

/* ================= NAV ================= */

function showSection(name) {
  dashboardSection.style.display = name==="dashboard"?"block":"none";
  projectSection.style.display = name==="projects"?"block":"none";
  taskSection.style.display = name==="tasks"?"block":"none";
  userSection.style.display = name==="users"?"block":"none";
}

/* ================= LOGOUT ================= */

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}