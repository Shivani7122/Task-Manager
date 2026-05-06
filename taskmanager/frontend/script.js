const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev";

/* ================= LOGIN ================= */

async function login() {

  // ✅ IDs fixed
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

  try {

    const response = await fetch(`${API_URL}/api/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    const data = await response.json();

    console.log("LOGIN RESPONSE:", data);

    if (!response.ok) {
      msg.innerText = data.detail || "Invalid credentials ❌";
      return;
    }

    // ✅ save token
    localStorage.setItem("token", data.access);

    /* ================= GET USER ================= */

    const userResponse = await fetch(`${API_URL}/api/users/`, {
      headers: {
        "Authorization": "Bearer " + data.access
      }
    });

    const users = await userResponse.json();

    console.log("USERS:", users);

    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      msg.innerText = "User not found ❌";
      return;
    }

    localStorage.setItem("role", user.role.toLowerCase());
    localStorage.setItem("user_id", user.id);

    msg.innerText = "Login successful ✅";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);

  }

  catch (error) {

    console.error("FULL ERROR:", error);

    msg.innerText = "Server error ❌";

  }

  finally {

    btn.innerHTML = "Login";
    btn.disabled = false;

  }
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

    const btn = document.querySelector("#taskSection button");

    if (btn) {
      btn.style.display = "none";
    }
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

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("user_id");

  container.innerHTML = `<div class="loader"></div>`;

  fetch(`${API_URL}/api/tasks/`, {
    headers: authHeader()
  })

    .then(res => res.json())

    .then(tasks => {

      let filtered = role === "member"
        ? tasks.filter(t => t.assigned_to == userId)
        : tasks;

      const total = filtered.length;

      const done = filtered.filter(
        t => t.status === "done"
      ).length;

      const pending = filtered.filter(
        t => t.status === "pending"
      ).length;

      const overdue = filtered.filter(t =>
        t.deadline &&
        new Date(t.deadline) < new Date() &&
        t.status !== "done"
      ).length;

      container.innerHTML = `
        <div class="grid">
          <div>📌 Total: ${total}</div>
          <div>✅ Done: ${done}</div>
          <div>⏳ Pending: ${pending}</div>
          <div style="color:red;">⚠️ Overdue: ${overdue}</div>
        </div>
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

      const assigned = document.getElementById("assignedUser");

      if (assigned) {

        assigned.innerHTML =
          `<option value="">Select User</option>` +

          users.map(u => `
            <option value="${u.id}">
              👤 ${u.username} (${u.role})
            </option>
          `).join("");
      }

      const createdBy = document.getElementById("createdBySelect");

      if (createdBy) {

        createdBy.innerHTML =
          `<option value="">Select User</option>` +

          users.map(u => `
            <option value="${u.id}">
              👤 ${u.username}
            </option>
          `).join("");
      }

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

/* ================= PROJECTS ================= */

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

          ${role === "admin"
            ? `<button onclick="deleteProject(${p.id})">❌</button>`
            : ""
          }

        </div>

      `).join("");

      const dropdown = document.getElementById("projectSelect");

      if (dropdown) {

        dropdown.innerHTML =
          `<option value="">Select Project</option>` +

          data.map(p => `
            <option value="${p.id}">
              📦 ${p.title}
            </option>
          `).join("");
      }
    });
}

/* ================= TASKS ================= */

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

      container.innerHTML = filtered.map(t => {

        const isOverdue =
          t.deadline &&
          new Date(t.deadline) < new Date() &&
          t.status !== "done";

        return `

          <div class="task-card"
            style="${isOverdue ? 'border:2px solid red;' : ''}">

            <h4>${t.title}</h4>

            <p>${t.description || ""}</p>

            <small>
              👤 ${t.assigned_to_username}
              |
              📦 ${t.project_title}
            </small>

            <div class="status ${t.status}">
              ${formatStatus(t.status)}
            </div>

            ${isOverdue
              ? `<div style="color:red;">⚠️ Overdue</div>`
              : ""
            }

          </div>

        `;
      }).join("");
    });
}

/* ================= HELPERS ================= */

function formatStatus(status) {

  return status === "pending"
    ? "⏳ Pending"

    : status === "in_progress"
    ? "🚀 In Progress"

    : "✅ Completed";
}

function authHeader() {

  return {
    Authorization:
      "Bearer " + localStorage.getItem("token")
  };
}

/* ================= NAVIGATION ================= */

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