const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev";

/* ================= LOGIN ================= */
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.querySelector('input[name="role"]:checked')?.value;
  const msg = document.getElementById("msg");
  const btn = document.querySelector("button");

  if (!username || !password || !role) {
    msg.innerText = "Fill all fields ❌";
    return;
  }

  btn.innerHTML = "Loading...";
  btn.disabled = true;

  fetch(`${API_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.access) {
        msg.innerText = "Invalid credentials ❌";
        return;
      }

      return fetch(`${API_URL}/api/users/`, {
        headers: { Authorization: "Bearer " + data.access }
      })
        .then(res => res.json())
        .then(users => {
          const user = users.find(u => u.username === username);

          if (!user || user.role !== role) {
            msg.innerText = "Wrong role selected ❌";
            return;
          }

          localStorage.setItem("token", data.access);
          localStorage.setItem("role", user.role);
          localStorage.setItem("user_id", user.id);

          window.location.href = "dashboard.html";
        });
    })
    .catch(() => msg.innerText = "Server error ❌")
    .finally(() => {
      btn.innerHTML = "Login";
      btn.disabled = false;
    });
}

/* ================= INIT ================= */
function initApp() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  if (role === "member") {
    document.getElementById("projectSection").style.display = "none";
    document.getElementById("userSection").style.display = "none";
  }

  loadUsers();
  loadProjects();
  loadTasks();
  loadDashboard();

  showSection("dashboard");
}

/* ================= DASHBOARD ================= */
function loadDashboard() {
  const container = document.getElementById("dashboard");
  container.innerHTML = `<div class="loader"></div>`;

  fetch(`${API_URL}/api/dashboard/`, {
    headers: authHeader()
  })
    .then(res => res.json())
    .then(d => {
      container.innerHTML = `
        <div>📌 Total: ${d.total_tasks}</div>
        <div>✅ Done: ${d.completed_tasks}</div>
        <div>⏳ Pending: ${d.pending_tasks}</div>
        <div>⚠️ Overdue: ${d.overdue_tasks}</div>
      `;
    });
}

/* ================= USERS ================= */
function loadUsers() {
  fetch(`${API_URL}/api/users/`, {
    headers: authHeader()
  })
    .then(res => res.json())
    .then(users => {

      // Assigned dropdown
      const assigned = document.getElementById("assignedUser");
      if (assigned) {
        assigned.innerHTML =
          `<option value="">Select User</option>` +
          users.map(u =>
            `<option value="${u.id}">👤 ${u.username} (${u.role})</option>`
          ).join("");
      }

      // Created by dropdown
      const createdBy = document.getElementById("createdBySelect");
      if (createdBy) {
        createdBy.innerHTML =
          `<option value="">Select User</option>` +
          users.map(u =>
            `<option value="${u.id}">👤 ${u.username}</option>`
          ).join("");
      }

      // User list
      const list = document.getElementById("usersList");
      if (list) {
        list.innerHTML = users.map(u => `
          <div class="card-item">
            <div>
              <b>${u.username}</b> (${u.role})<br>
              <span style="color:${u.is_active ? 'lime' : 'gray'}">●</span>
              ${u.is_active ? "Active" : "Inactive"}
              ${u.is_superuser ? "| ⭐ Superuser" : ""}
            </div>
            <button onclick="deleteUser(${u.id})">❌</button>
          </div>
        `).join("");
      }
    });
}

/* ================= PROJECT ================= */
function loadProjects() {
  const container = document.getElementById("projectList");
  container.innerHTML = `<div class="loader"></div>`;

  fetch(`${API_URL}/api/projects/`, {
    headers: authHeader()
  })
    .then(res => res.json())
    .then(data => {

      const role = localStorage.getItem("role");

      container.innerHTML = data.map(p => `
        <div class="card-item">
          <div>
            <b>${p.title}</b><br>
            <small>${p.description || ""}</small>
          </div>
          ${role === "admin" ? `<button onclick="deleteProject(${p.id})">❌</button>` : ""}
        </div>
      `).join("");

      const dropdown = document.getElementById("projectSelect");
      if (dropdown) {
        dropdown.innerHTML =
          `<option value="">Select Project</option>` +
          data.map(p =>
            `<option value="${p.id}">📦 ${p.title}</option>`
          ).join("");
      }
    });
}

/* ================= TASK ================= */
function loadTasks() {
  const container = document.getElementById("tasksDiv");
  container.innerHTML = `<div class="loader"></div>`;

  fetch(`${API_URL}/api/tasks/`, {
    headers: authHeader()
  })
    .then(res => res.json())
    .then(tasks => {

      const role = localStorage.getItem("role");
      const userId = localStorage.getItem("user_id");

      let filtered = role === "member"
        ? tasks.filter(t => t.assigned_to == userId)
        : tasks;

      container.innerHTML = filtered.map(t => `
        <div class="task-card">
          <h4>${t.title}</h4>
          <p>${t.description}</p>

          <small>👤 ${t.assigned_to_username} | 📦 ${t.project_title}</small>

          <div class="status ${t.status}">
            ${formatStatus(t.status)}
          </div>

          <select onchange="updateTask(${t.id}, this.value)">
            <option value="pending" ${t.status==="pending"?"selected":""}>Pending</option>
            <option value="in_progress" ${t.status==="in_progress"?"selected":""}>In Progress</option>
            <option value="done" ${t.status==="done"?"selected":""}>Done</option>
          </select>

          ${role === "admin"
            ? `<button onclick="deleteTask(${t.id})">❌</button>`
            : ""}
        </div>
      `).join("");
    });
}

function formatStatus(status) {
  return status === "pending" ? "⏳ Pending" :
         status === "in_progress" ? "🚀 In Progress" :
         "✅ Completed";
}

/* ================= CREATE TASK ================= */
function createTask() {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    alert("Only admin allowed ❌");
    return;
  }

  const data = {
    title: document.getElementById("taskTitle").value,
    description: document.getElementById("taskDesc").value,
    status: document.getElementById("status").value,
    assigned_to: document.getElementById("assignedUser").value,
    project: document.getElementById("projectSelect").value,
    deadline: document.getElementById("deadline").value
  };

  if (!data.title || !data.description || !data.assigned_to || !data.project || !data.deadline) {
    alert("Fill all fields ❌");
    return;
  }

  fetch(`${API_URL}/api/tasks/create/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data)
  }).then(loadTasks);
}

/* ================= UPDATE TASK ================= */
function updateTask(id, status) {
  fetch(`${API_URL}/api/tasks/${id}/update/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ status })
  }).then(loadTasks);
}

/* ================= DELETE TASK ================= */
function deleteTask(id) {
  fetch(`${API_URL}/api/tasks/${id}/delete/`, {
    method: "DELETE",
    headers: authHeader()
  }).then(loadTasks);
}

/* ================= PROJECT ================= */
function createProject() {
  const title = document.getElementById("projectTitle").value;
  const description = document.getElementById("projectDesc").value;
  const createdBy = document.getElementById("createdBySelect").value;

  if (!title || !description || !createdBy) {
    alert("Fill all fields ❌");
    return;
  }

  fetch(`${API_URL}/api/projects/create/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ title, description, created_by: parseInt(createdBy) })
  }).then(loadProjects);
}

function deleteProject(id) {
  fetch(`${API_URL}/api/projects/${id}/delete/`, {
    method: "DELETE",
    headers: authHeader()
  }).then(loadProjects);
}

/* ================= USER ================= */
function createUser() {
  fetch(`${API_URL}/api/users/create/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({
      username: newUsername.value,
      password: newPassword.value,
      role: newRole.value,
      is_superuser: isSuperuser.checked,
      is_active: isActive.checked
    })
  }).then(loadUsers);
}

function deleteUser(id) {
  fetch(`${API_URL}/api/users/${id}/delete/`, {
    method: "DELETE",
    headers: authHeader()
  }).then(loadUsers);
}

/* ================= AUTH ================= */
function authHeader() {
  return {
    Authorization: "Bearer " + localStorage.getItem("token")
  };
}

/* ================= NAV ================= */
function showSection(name) {
  const sections = {
    dashboard: "dashboardSection",
    projects: "projectSection",
    tasks: "taskSection",
    users: "userSection"
  };

  Object.values(sections).forEach(id => {
    document.getElementById(id).style.display = "none";
  });

  document.getElementById(sections[name]).style.display = "block";
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}