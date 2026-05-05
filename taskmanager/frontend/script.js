const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev";

/* ================= LOGIN ================= */
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.querySelector('input[name="role"]:checked').value;
  const msg = document.getElementById("msg");
  const btn = document.querySelector("button");

  if (!username || !password) {
    msg.innerText = "Enter username & password";
    return;
  }

  // 🔄 Loader ON
  btn.innerHTML = "Loading...";
  btn.disabled = true;

  fetch(`${API_URL}/api/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  })
    .then(async res => {
      const data = await res.json();

      if (res.ok && data.access) {

        // 🔥 Fetch user details
        fetch(`${API_URL}/api/users/`, {
          headers: {
            Authorization: "Bearer " + data.access
          }
        })
          .then(res => res.json())
          .then(users => {
            const user = users.find(u => u.username === username);

            if (!user) {
              msg.innerText = "User not found";
              return;
            }

            // 🔐 Role check
            if (user.role !== role) {
              msg.innerText = "Wrong role selected ❌";
              return;
            }

            // ✅ Save
            localStorage.setItem("token", data.access);
            localStorage.setItem("role", user.role);
            localStorage.setItem("user_id", user.id);

            window.location.href = "dashboard.html";
          });

      } else {
        msg.innerText = data.detail || "Invalid credentials";
      }
    })
    .catch(() => {
      msg.innerText = "Server error";
    })
    .finally(() => {
      // 🔄 Loader OFF
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

  // 🔥 Role-based UI
  if (role !== "admin") {
    document.getElementById("projectSection").style.display = "none";
    document.getElementById("userSection").style.display = "none";
  }

  loadUsers();
  loadProjects();
  loadTasks();
  loadDashboard();
}

/* ================= DASHBOARD ================= */
function loadDashboard() {
  document.getElementById("dashboard").innerHTML =
    `<div class="loader"></div>`;

  fetch(`${API_URL}/api/dashboard/`, {
    headers: authHeader()
  })
    .then(res => res.json())
    .then(d => {
      document.getElementById("dashboard").innerHTML = `
        <div>Total: ${d.total_tasks}</div>
        <div>Done: ${d.completed_tasks}</div>
        <div>Pending: ${d.pending_tasks}</div>
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

      // dropdown
      const dropdown = document.getElementById("assignedUser");
      if (dropdown) {
        dropdown.innerHTML = users.map(u =>
          `<option value="${u.id}">${u.username}</option>`
        ).join("");
      }

      // user list
      const list = document.getElementById("usersList");
      if (list) {
        list.innerHTML = users.map(u => `
          <div class="card-item">
            <div>
              <b>${u.username}</b> (${u.role})<br>
              Active: ${u.is_active ? "Yes" : "No"} |
              Superuser: ${u.is_superuser ? "Yes" : "No"}
            </div>
            <button onclick="deleteUser(${u.id})">❌</button>
          </div>
        `).join("");
      }
    });
}

/* ================= PROJECT ================= */
function loadProjects() {
  fetch(`${API_URL}/api/projects/`, {
    headers: authHeader()
  })
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("projectList");
      container.innerHTML = data.map(p => `
        <div class="card-item">
          <span>${p.title}</span>
          <button class="delete-btn"
            onclick="deleteProject(${p.id})">❌</button>
        </div>
      `).join("");
    });
}

/* ================= TASK ================= */
function loadTasks() {
  fetch(`${API_URL}/api/tasks/`, {
    headers: authHeader()
  })
    .then(res => res.json())
    .then(tasks => {
      document.getElementById("tasksDiv").innerHTML = tasks.map(t => `
        <div class="task-card">
          <h4>${t.title}</h4>
          <p>${t.description}</p>
          <small>👤 ${t.assigned_to_username} | 📦 ${t.project_title}</small>
          <div class="status ${t.status}">${t.status}</div>

          <select onchange="updateTask(${t.id}, this.value)">
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <button onclick="deleteTask(${t.id})">❌</button>
        </div>
      `).join("");
    });
}

/* ================= CREATE TASK ================= */
function createTask() {
  const data = {
    title: taskTitle.value,
    description: taskDesc.value,
    status: status.value,
    assigned_to: assignedUser.value,
    project: projectSelect.value,
    deadline: deadline.value
  };

  fetch(`${API_URL}/api/tasks/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader()
    },
    body: JSON.stringify(data)
  }).then(loadTasks);
}

/* ================= UPDATE TASK ================= */
function updateTask(id, status) {
  fetch(`${API_URL}/api/tasks/${id}/update/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader()
    },
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
  const title = projectTitle.value.trim();
  const description = projectDesc.value.trim();
  const createdBy = createdBySelect.value;

  if (!title || !description || !createdBy) {
    alert("Fill all fields");
    return;
  }

  fetch(`${API_URL}/api/projects/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader()
    },
    body: JSON.stringify({
      title,
      description,
      created_by: parseInt(createdBy)
    })
  }).then(loadProjects);
}

function deleteProject(id) {
  if (!confirm("Delete project?")) return;

  fetch(`${API_URL}/api/projects/${id}/delete/`, {
    method: "DELETE",
    headers: authHeader()
  }).then(loadProjects);
}

/* ================= USER ================= */
function createUser() {
  fetch(`${API_URL}/api/users/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader()
    },
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
  dashboardSection.style.display = name === "dashboard" ? "block" : "none";
  projectSection.style.display = name === "projects" ? "block" : "none";
  taskSection.style.display = name === "tasks" ? "block" : "none";
  userSection.style.display = name === "users" ? "block" : "none";
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}