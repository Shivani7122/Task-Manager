const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev";

/* ========= LOGIN ========= */
function login() {
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
    let html = "";
    const role = getUserRole();

    tasks.forEach(t => {
      html += `
        <div class="task">
          <div>
            <b>${t.title}</b><br>
            <span class="${t.status}">${t.status}</span>
          </div>

          <div>
            ${role === "admin" ? `<button onclick="deleteTask(${t.id})">🗑</button>` : ""}
            <button onclick="updateStatus(${t.id},'done')">✔</button>
          </div>
        </div>
      `;
    });

    tasksDiv.innerHTML = html;
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
  }).then(() => {
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

/* ========= UPDATE ========= */
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

/* ========= USERS ========= */
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

/* ========= USER LIST ========= */
function loadUsersList() {
  if (getUserRole() !== "admin") return;

  fetch(`${API_URL}/api/users/`, {
    headers: { Authorization: "Bearer " + getToken() }
  })
  .then(res => res.json())
  .then(users => {
    usersList.innerHTML = users.map(u => `
      <div class="task">
        <span>${u.username} (${u.role})</span>
        <button onclick="deleteUser(${u.id})">🗑</button>
      </div>
    `).join("");
  });
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
        <button onclick="deleteProject(${p.id})">🗑</button>
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
  applyRoleUI();
  loadDashboard();
  loadTasks();
  loadUsers();
  loadProjects();
  loadProjectList();
  loadUsersList();
}