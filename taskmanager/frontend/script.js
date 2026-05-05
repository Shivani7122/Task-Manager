const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev";

/* ================= LOGIN ================= */
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  fetch(`${API_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
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
  .catch(() => {
    msg.innerText = "Server error";
  });
}

/* ================= TOKEN ================= */
function getToken() {
  return localStorage.getItem("token");
}

/* ================= ROLE ================= */
function getUserRole() {
  const token = getToken();
  if (!token) return null;

  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.role;
}

/* ================= APPLY ROLE ================= */
function applyRoleUI() {
  const role = getUserRole();

  if (role === "member") {
    document.getElementById("projectSection").style.display = "none";
    document.getElementById("taskSection").style.display = "none";
  }
}

/* ================= DASHBOARD ================= */
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

/* ================= TASKS ================= */
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
            <small>${t.description || ""}</small><br>
            <span class="${t.status}">${t.status}</span>
          </div>

          <div>
            ${
              role === "admin"
                ? `<button onclick="deleteTask(${t.id})">🗑</button>`
                : ""
            }
            <button onclick="updateStatus(${t.id}, 'done')">✔</button>
          </div>
        </div>
      `;
    });

    tasksDiv.innerHTML = html;
  });
}

/* ================= CREATE TASK ================= */
function createTask() {
  if (getUserRole() !== "admin") {
    alert("Only admin can create tasks");
    return;
  }

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
    loadTasks();
    loadDashboard();
  });
}

/* ================= DELETE TASK ================= */
function deleteTask(id) {
  if (getUserRole() !== "admin") {
    alert("Only admin can delete");
    return;
  }

  fetch(`${API_URL}/api/tasks/${id}/delete/`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + getToken()
    }
  }).then(() => loadTasks());
}

/* ================= UPDATE STATUS ================= */
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

/* ================= USERS ================= */
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

/* ================= PROJECTS ================= */
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

/* ================= CREATE PROJECT ================= */
function createProject() {
  if (getUserRole() !== "admin") {
    alert("Only admin can create project");
    return;
  }

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
  }).then(() => loadProjects());
}

/* ================= NAVIGATION ================= */
function showSection(name) {
  dashboardSection.style.display = name === "dashboard" ? "block" : "none";
  projectSection.style.display = name === "projects" ? "block" : "none";
  taskSection.style.display = name === "tasks" ? "block" : "none";
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

/* ================= INIT ================= */
function initApp() {
  applyRoleUI();
  loadDashboard();
  loadTasks();
  loadUsers();
  loadProjects();
}