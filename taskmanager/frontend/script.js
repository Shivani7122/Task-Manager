const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev";

/* ================= LOGIN ================= */
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  fetch(`${API_URL}/api/auth/login/`, {   // ✅ FIXED URL
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(res => {
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  })
  .then(data => {
    if (data.access) {
      localStorage.setItem("token", data.access);
      window.location.href = "dashboard.html";
    } else {
      msg.innerText = "Invalid credentials";
    }
  })
  .catch(err => {
    console.error(err);
    msg.innerText = "Server / API error";
  });
}


/* ================= COMMON AUTH ================= */
function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    }
  }).then(res => {
    if (!res.ok) throw new Error("API error");
    return res.json();
  });
}


/* ================= DASHBOARD ================= */
function loadDashboard() {
  authFetch(`${API_URL}/api/dashboard/`)
  .then(d => {
    document.getElementById("dashboard").innerHTML = `
      <div>Total<br>${d.total_tasks}</div>
      <div>Completed<br>${d.completed_tasks}</div>
      <div>Pending<br>${d.pending_tasks}</div>
      <div>Overdue<br>${d.overdue_tasks}</div>
    `;
  })
  .catch(err => console.error("Dashboard error:", err));
}


/* ================= TASKS ================= */
function loadTasks() {
  authFetch(`${API_URL}/api/tasks/`)
  .then(tasks => {
    const tasksDiv = document.getElementById("tasks");

   tasksDiv.innerHTML = tasks.map(t => `
  <div class="task-card">
    
    <div class="task-left">
      <h4>${t.title}</h4>
      <p>${t.description}</p>
      <span class="status ${t.status}">${t.status}</span>
    </div>

    <div class="task-actions">
      <button onclick="updateStatus(${t.id},'done')">✔</button>
      <button onclick="deleteTask(${t.id})">🗑</button>
    </div>

  </div>
`).join("");
  })
  .catch(err => console.error("Tasks error:", err));
}


/* ================= DELETE TASK ================= */
function deleteTask(id) {
  if (!confirm("Delete this task?")) return;

  fetch(`${API_URL}/api/tasks/${id}/delete/`, {   // ✅ FIXED
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
  .then(res => {
    if (!res.ok) throw new Error("Delete failed");
    return res.json();
  })
  .then(() => {
    loadTasks();
    loadDashboard();
  })
  .catch(err => {
    console.error(err);
    alert("Delete failed");
  });
}


/* ================= PROJECTS ================= */
function loadProjects() {
  authFetch(`${API_URL}/api/projects/`)
  .then(projects => {

    // dropdown
    document.getElementById("projectSelect").innerHTML =
      projects.map(p => `<option value="${p.id}">${p.title}</option>`).join("");

    // list
    document.getElementById("projectList").innerHTML =
      projects.map(p => `
        <div class="task-card">
          ${p.title}
          <button onclick="deleteProject(${p.id})">🗑</button>
        </div>
      `).join("");
  })
  .catch(err => console.error("Project error:", err));
}


/* ================= DELETE PROJECT ================= */
function deleteProject(id) {
  if (!confirm("Delete this project?")) return;

  authFetch(`${API_URL}/api/delete-project/${id}/`, {
    method: "DELETE"
  })
  .then(loadProjects)
  .catch(err => console.error("Delete project error:", err));
}


/* ================= USERS ================= */
function loadUsers() {
  authFetch(`${API_URL}/api/users/`)
  .then(users => {
    document.getElementById("assignedUser").innerHTML =
      users.map(u => `<option value="${u.id}">${u.username}</option>`).join("");
  })
  .catch(err => console.error("User error:", err));
}


/* ================= CREATE TASK ================= */
function createTask() {
  authFetch(`${API_URL}/api/tasks/create/`, {   // ✅ FIXED URL
    method: "POST",
    body: JSON.stringify({
      title: document.getElementById("taskTitle").value,
      description: document.getElementById("taskDesc").value,
      status: document.getElementById("status").value,
      assigned_to: document.getElementById("assignedUser").value,
      project: document.getElementById("projectSelect").value,
      deadline: document.getElementById("deadline").value
    })
  })
  .then(() => {
    loadTasks();
    loadDashboard();
  })
  .catch(err => console.error("Create task error:", err));
}


/* ================= CREATE PROJECT ================= */
function createProject() {
  authFetch(`${API_URL}/api/projects/create/`, {   // ✅ FIXED URL
    method: "POST",
    body: JSON.stringify({
      title: document.getElementById("projectTitle").value,
      description: document.getElementById("projectDesc").value
    })
  })
  .then(loadProjects)
  .catch(err => console.error("Create project error:", err));
}


/* ================= UPDATE STATUS ================= */
function updateStatus(id, status) {
  authFetch(`${API_URL}/api/tasks/${id}/update/`, {   // ✅ FIXED URL
    method: "PUT",
    body: JSON.stringify({ status })
  })
  .then(loadTasks)
  .catch(err => console.error("Update error:", err));
}


/* ================= NAVIGATION ================= */
function showSection(name) {
  document.getElementById("dashboardSection").style.display = name === "dashboard" ? "block" : "none";
  document.getElementById("projectSection").style.display = name === "projects" ? "block" : "none";
  document.getElementById("taskSection").style.display = name === "tasks" ? "block" : "none";
}


/* ================= LOGOUT ================= */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}