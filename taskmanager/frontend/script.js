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

  // 🔐 MEMBER LIMITATION
  if (role === "member") {
    document.getElementById("projectSection").style.display = "none";
    document.getElementById("userSection").style.display = "none";

    // hide sidebar buttons
    document.querySelector("button[onclick*='projects']").style.display = "none";
    document.querySelector("button[onclick*='users']").style.display = "none";
  }

  loadUsers();
  loadProjects();
  loadTasks();
  loadDashboard();

  showSection("dashboard");
}

/* ================= DASHBOARD ================= */
function loadDashboard() {
  document.getElementById("dashboard").innerHTML = `<div class="loader"></div>`;

  fetch(`${API_URL}/api/dashboard/`, {
    headers: authHeader()
  })
    .then(res => res.json())
    .then(d => {
      document.getElementById("dashboard").innerHTML = `
        <div>📌 Total Tasks: ${d.total_tasks}</div>
        <div>✅ Completed: ${d.completed_tasks}</div>
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

      // dropdown
      const dropdown = document.getElementById("assignedUser");
      if (dropdown) {
       dropdown.innerHTML = users.map(u =>
        `<option value="${u.id}">
          👤 ${u.username} (${u.role})
        </option>`
      ).join("");

      // user list
      const list = document.getElementById("usersList");
      if (list) {
        list.innerHTML = users.map(u => `
        <div class="card-item">
          <div>
            <b>${u.username}</b> (${u.role})
            <br>
            <span style="color:${u.is_active ? 'lime' : 'gray'}">●</span>
            ${u.is_active ? "Active" : "Inactive"} |
            ${u.is_superuser ? "⭐ Superuser" : ""}
          </div>

          <button onclick="deleteUser(${u.id})">❌</button>
        </div>
      `).join("");
      }
      const createdBy = document.getElementById("createdBySelect");
      if (createdBy) {
        createdBy.innerHTML = users.map(u =>
          `<option value="${u.id}">
            👤 ${u.username}
          </option>`
        ).join("");
      }
    });
}

/* ================= PROJECT ================= */
function loadProjects() {
  const container = document.getElementById("projectList");

  // 🔄 Loader
  container.innerHTML = `<div class="loader"></div>`;

  fetch(`${API_URL}/api/projects/`, {
    headers: authHeader()
  })
    .then(res => res.json())
    .then(data => {

      const role = localStorage.getItem("role");

      // ❌ No projects
      if (!data.length) {
        container.innerHTML = `<p style="opacity:0.6">No projects found</p>`;
        return;
      }

      // 🔥 Render list
      container.innerHTML = data.map(p => `
        <div class="card-item">

          <div>
            <b>${p.title}</b><br>
            <small style="opacity:0.6">${p.description || ""}</small>
          </div>

          <!-- 🔐 Admin only delete -->
          ${role === "admin"
            ? `<button class="delete-btn"
                onclick="deleteProject(${p.id})">❌</button>`
            : ""}

        </div>
      `).join("");

      // 🔥 Dropdown for task creation
      const dropdown = document.getElementById("projectSelect");
      if (dropdown) {
        dropdown.innerHTML = data.map(p =>
          `<option value="${p.id}">
              📦 ${p.title}
            </option>`
        ).join("");
      }

    })
    .catch(() => {
      container.innerHTML = `<p style="color:red">Error loading projects</p>`;
    });
}

/* ================= TASK ================= */
function loadTasks() {
  const container = document.getElementById("tasksDiv");

  // 🔄 Loader
  container.innerHTML = `<div class="loader"></div>`;

  fetch(`${API_URL}/api/tasks/`, {
    headers: authHeader()
  })
    .then(res => res.json())
    .then(tasks => {

      const role = localStorage.getItem("role");
      const userId = localStorage.getItem("user_id");

      // 🔐 Member → only own tasks
      let filteredTasks = tasks;
      if (role === "member") {
        filteredTasks = tasks.filter(t => t.assigned_to == userId);
      }

      // ❌ No tasks case
      if (filteredTasks.length === 0) {
        container.innerHTML = `<p style="opacity:0.6">No tasks found</p>`;
        return;
      }

      container.innerHTML = filteredTasks.map(t => `
        <div class="task-card">

          <h4>${t.title}</h4>
          <p>${t.description}</p>

          <small>
            👤 ${t.assigned_to_username} | 📦 ${t.project_title}
          </small>

          <div class="status ${t.status}">
            ${formatStatus(t.status)}
          </div>

          <!-- 🔥 STATUS DROPDOWN -->
          <select onchange="updateTask(${t.id}, this.value)">
            <option value="pending" ${t.status==="pending"?"selected":""}>Pending</option>
            <option value="in_progress" ${t.status==="in_progress"?"selected":""}>In Progress</option>
            <option value="done" ${t.status==="done"?"selected":""}>Done</option>
          </select>

          <!-- 🔐 Delete only for admin -->
          ${role === "admin" ? 
            `<button onclick="deleteTask(${t.id})">❌</button>` 
            : ""}

        </div>
      `).join("");
    })
    .catch(() => {
      container.innerHTML = `<p style="color:red">Error loading tasks</p>`;
    });
}

function formatStatus(status) {
  if (status === "pending") return "⏳ Pending";
  if (status === "in_progress") return "🚀 In Progress";
  if (status === "done") return "✅ Completed";
  return status;
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
  const title = document.getElementById("projectTitle").value.trim();
  const description = document.getElementById("projectDesc").value.trim();
  const createdBy = document.getElementById("createdBySelect").value;

  if (!title || !description || !createdBy) {
    alert("All fields required ❌");
    return;
  }

  fetch(`${API_URL}/api/projects/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader()
    },
    body: JSON.stringify({
      title: title,
      description: description,
      created_by: parseInt(createdBy)
    })
  })
    .then(async res => {
      const data = await res.json();

      if (!res.ok) {
        alert("❌ " + JSON.stringify(data));
        return;
      }

      alert("✅ Project Created");

      // 🔄 reset fields
      document.getElementById("projectTitle").value = "";
      document.getElementById("projectDesc").value = "";

      loadProjects();
    })
    .catch(() => {
      alert("Server error ❌");
    });
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
  const sections = {
    dashboard: "dashboardSection",
    projects: "projectSection",
    tasks: "taskSection",
    users: "userSection"
  };

  // hide all
  Object.values(sections).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  // show selected
  const active = document.getElementById(sections[name]);
  if (active) active.style.display = "block";
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}