const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev";

/* ================= LOGIN ================= */
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  fetch(`${API_URL}/api/login/`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.access) {
      localStorage.setItem("token", data.access);
      window.location.href = "dashboard.html";
    } else {
      msg.innerText = "Invalid credentials";
    }
  })
  .catch(() => {
    msg.innerText = "Server error";
  });
}


/* ================= DASHBOARD ================= */
function loadDashboard() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  fetch(`${API_URL}/api/dashboard/`, {
    headers: { Authorization: "Bearer " + token }
  })
  .then(res => {
    if (res.status === 401) {
      logout();
    }
    return res.json();
  })
  .then(data => {
    document.getElementById("dashboard").innerHTML = `
      <div>Total<br>${data.total_tasks}</div>
      <div>Completed<br>${data.completed_tasks}</div>
      <div>Pending<br>${data.pending_tasks}</div>
      <div>Overdue<br>${data.overdue_tasks}</div>
    `;
  })
  .catch(err => console.error("Dashboard error:", err));
}


/* ================= TASKS ================= */
function loadTasks() {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/api/tasks/`, {
    headers: { Authorization: "Bearer " + token }
  })
  .then(res => res.json())
  .then(tasks => {
    let html = "";

    tasks.forEach(t => {
      html += `
        <div class="task">
          <span>${t.title} <b class="${t.status}">(${t.status})</b></span>
          <button onclick="updateStatus(${t.id}, 'done')">✔</button>
        </div>
      `;
    });

    document.getElementById("tasks").innerHTML = html;
  })
  .catch(err => console.error("Tasks error:", err));
}


/* ================= USERS ================= */
function loadUsers() {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/api/users/`, {
    headers: { Authorization: "Bearer " + token }
  })
  .then(res => res.json())
  .then(users => {
    let html = "";
    users.forEach(u => {
      html += `<option value="${u.id}">${u.username}</option>`;
    });

    document.getElementById("assignedUser").innerHTML = html;
  })
  .catch(err => console.error("Users error:", err));
}


/* ================= PROJECTS ================= */
function loadProjects() {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/api/projects/`, {
    headers: { Authorization: "Bearer " + token }
  })
  .then(res => res.json())
  .then(data => {
    let html = "";

    data.forEach(p => {
      html += `<option value="${p.id}">${p.title}</option>`;
    });

    document.getElementById("projectSelect").innerHTML = html;
  })
  .catch(err => console.error("Projects error:", err));
}


/* ================= CREATE TASK ================= */
function createTask() {
  const token = localStorage.getItem("token");

  const data = {
    title: document.getElementById("taskTitle").value,
    description: document.getElementById("taskDesc").value,
    status: document.getElementById("status").value,
    assigned_to: document.getElementById("assignedUser").value,
    project: document.getElementById("projectSelect").value,
    deadline: document.getElementById("deadline").value
  };

  fetch(`${API_URL}/api/create-task/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(data)
  })
  .then(() => {
    loadTasks();
    loadDashboard();
  })
  .catch(err => console.error("Create task error:", err));
}


/* ================= CREATE PROJECT ================= */
function createProject() {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/api/create-project/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      title: document.getElementById("projectTitle").value,
      description: document.getElementById("projectDesc").value
    })
  })
  .then(() => loadProjects())
  .catch(err => console.error("Project error:", err));
}


/* ================= UPDATE ================= */
function updateStatus(id, status) {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/api/update-task/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ status })
  })
  .then(() => {
    loadTasks();
    loadDashboard();
  })
  .catch(err => console.error("Update error:", err));
}


/* ================= NAV ================= */
function showSection(name) {
  document.getElementById("dashboardSection").style.display =
    name === "dashboard" ? "block" : "none";

  document.getElementById("projectSection").style.display =
    name === "projects" ? "block" : "none";

  document.getElementById("taskSection").style.display =
    name === "tasks" ? "block" : "none";
}


/* ================= LOGOUT ================= */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}