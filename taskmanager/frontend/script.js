const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev";

/* ========= DOM ========= */
const tasksDiv = document.getElementById("tasks");
const assignedUser = document.getElementById("assignedUser");
const projectSelect = document.getElementById("projectSelect");
const projectList = document.getElementById("projectList");
const usersList = document.getElementById("usersList");

const dashboard = document.getElementById("dashboard");

const dashboardSection = document.getElementById("dashboardSection");
const projectSection = document.getElementById("projectSection");
const taskSection = document.getElementById("taskSection");
const userSection = document.getElementById("userSection");

/* ========= LOGIN ========= */
function login() {
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const msg = document.getElementById("msg");

  fetch(`${API_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) {
      msg.innerText = data.detail || "Login failed";
      return;
    }

    localStorage.setItem("token", data.access);
    window.location.href = "dashboard.html";
  })
  .catch(() => msg.innerText = "Server error");
}

/* ========= TOKEN ========= */
function getToken() {
  return localStorage.getItem("token");
}

/* ========= ROLE ========= */
function getUserRole() {
  const token = getToken();
  if (!token) return null;
  return JSON.parse(atob(token.split('.')[1])).role;
}

/* ========= AUTH GUARD ========= */
function checkAuth() {
  if (!getToken()) {
    window.location.href = "index.html";
  }
}

/* ========= UI CONTROL ========= */
function applyRoleUI() {
  const role = getUserRole();

  if (role === "member") {
    projectSection.style.display = "none";
    taskSection.style.display = "none";
    userSection.style.display = "none";
  }
}

/* ========= DASHBOARD ========= */
function loadDashboard() {
  fetch(`${API_URL}/api/dashboard/`, {
    headers: { Authorization: "Bearer " + getToken() }
  })
  .then(res => res.json())
  .then(d => {
    dashboard.innerHTML = `
      <div>Total<br>${d.total_tasks}</div>
      <div>Completed<br>${d.completed_tasks}</div>
      <div>Pending<br>${d.pending_tasks}</div>
      <div>Overdue<br>${d.overdue_tasks}</div>
    `;
  });
}

/* ========= TASKS ========= */
function loadTasks() {
  fetch(`${API_URL}/api/tasks/`, {
    headers: { Authorization: "Bearer " + getToken() }
  })
  .then(res => res.json())
  .then(tasks => {
    const role = getUserRole();

    tasksDiv.innerHTML = tasks.map(t => `
      <div class="task">
        <div>
          <b>${t.title}</b><br>
          <small>${t.description || ""}</small><br>
          👤 ${t.assigned_to_username || "N/A"} <br>
          📦 ${t.project_title || "N/A"} <br>
          <span class="${t.status}">${t.status}</span>
        </div>

        <div>
          ${role === "admin" ? `<button onclick="deleteTask(${t.id})">🗑</button>` : ""}

          <button onclick="updateStatus(${t.id}, 'pending')">P</button>
          <button onclick="updateStatus(${t.id}, 'in_progress')">IP</button>
          <button onclick="updateStatus(${t.id}, 'done')">✔</button>
        </div>
      </div>
    `).join("");
  });
}

/* ========= CREATE TASK ========= */
function createTask() {
  if (getUserRole() !== "admin") return alert("Admin only");

  fetch(`${API_URL}/api/tasks/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken()
    },
    body: JSON.stringify({
      title: taskTitle.value,
      description: taskDesc.value,
      status: status.value,
      assigned_to: assignedUser.value,
      project: projectSelect.value,
      deadline: deadline.value
    })
  })
  .then(() => {
    taskTitle.value = "";
    taskDesc.value = "";
    deadline.value = "";

    loadTasks();
    loadDashboard();
  });
}

/* ========= DELETE TASK ========= */
function deleteTask(id) {
  fetch(`${API_URL}/api/tasks/${id}/delete/`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + getToken() }
  }).then(() => loadTasks());
}

/* ========= UPDATE STATUS ========= */
function updateStatus(id, status) {
  fetch(`${API_URL}/api/tasks/${id}/update/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken()
    },
    body: JSON.stringify({ status })
  }).then(() => loadTasks());
}

/* ========= USERS DROPDOWN ========= */
function loadUsers() {
  fetch(`${API_URL}/api/users/`, {
    headers: { Authorization: "Bearer " + getToken() }
  })
  .then(res => res.json())
  .then(data => {
    assignedUser.innerHTML = data.map(u =>
      `<option value="${u.id}">${u.username}</option>`
    ).join("");
  });
}

/* ========= USERS LIST ========= */
function loadUsersList() {
  if (getUserRole() !== "admin") return;

  fetch(`${API_URL}/api/users/`, {
    headers: { Authorization: "Bearer " + getToken() }
  })
  .then(res => res.json())
  .then(users => {
    usersList.innerHTML = users.map(u => `
      <div class="task">
        <div>
          <b>${u.username}</b><br>
          Role: ${u.role} <br>
          Status: ${u.is_active ? "Active" : "Inactive"}
        </div>

        <div>
          <button onclick="changeRole(${u.id}, 'admin')">A</button>
          <button onclick="changeRole(${u.id}, 'member')">M</button>
          <button onclick="toggleUserStatus(${u.id}, ${u.is_active})">⚡</button>
          <button onclick="deleteUser(${u.id})">🗑</button>
        </div>
      </div>
    `).join("");
  });
}

/* ========= USER ACTIONS ========= */
function changeRole(id, role) {
  fetch(`${API_URL}/api/users/${id}/update/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken()
    },
    body: JSON.stringify({ role })
  }).then(() => loadUsersList());
}

function toggleUserStatus(id, currentStatus) {
  fetch(`${API_URL}/api/users/${id}/update/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken()
    },
    body: JSON.stringify({ is_active: !currentStatus })
  }).then(() => loadUsersList());
}

function createUser() {
  fetch(`${API_URL}/api/users/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken()
    },
    body: JSON.stringify({
      username: newUsername.value,
      password: newPassword.value,
      role: newRole.value,
      is_superuser: isSuperuser.checked,
      is_active: isActive.checked
    })
  }).then(() => loadUsersList());
}

function deleteUser(id) {
  fetch(`${API_URL}/api/users/${id}/delete/`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + getToken() }
  }).then(() => loadUsersList());
}

/* ========= PROJECTS ========= */
function loadProjects() {
  fetch(`${API_URL}/api/projects/`, {
    headers: { Authorization: "Bearer " + getToken() }
  })
  .then(res => res.json())
  .then(data => {
    projectSelect.innerHTML = data.map(p =>
      `<option value="${p.id}">${p.title}</option>`
    ).join("");
  });
}

function loadProjectList() {
  fetch(`${API_URL}/api/projects/`, {
    headers: { Authorization: "Bearer " + getToken() }
  })
  .then(res => res.json())
  .then(data => {
    projectList.innerHTML = data.map(p => `
      <div class="task">
        <span>${p.title}</span>
        ${getUserRole() === "admin" ? `<button onclick="deleteProject(${p.id})">🗑</button>` : ""}
      </div>
    `).join("");
  });
}

function createProject() {
  fetch(`${API_URL}/api/projects/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken()
    },
    body: JSON.stringify({
      title: projectTitle.value,
      description: projectDesc.value
    })
  }).then(() => loadProjectList());
}

function deleteProject(id) {
  if (getUserRole() !== "admin") return alert("Admin only");

  fetch(`${API_URL}/api/projects/${id}/delete/`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + getToken() }
  }).then(() => loadProjectList());
}

/* ========= NAV ========= */
function showSection(name) {
  dashboardSection.style.display = name==="dashboard"?"block":"none";
  projectSection.style.display = name==="projects"?"block":"none";
  taskSection.style.display = name==="tasks"?"block":"none";
  userSection.style.display = name==="users"?"block":"none";
}

/* ========= LOGOUT ========= */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

/* ========= INIT ========= */
function initApp() {
  checkAuth();
  applyRoleUI();

  loadUsers();
  loadProjects();

  loadDashboard();
  loadTasks();

  loadProjectList();
  loadUsersList();
}