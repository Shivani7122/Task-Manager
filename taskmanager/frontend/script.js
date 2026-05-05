const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev";

/* ================= LOGIN ================= */
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  fetch(`${API_URL}/api/auth/login/`, {
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
  .catch(() => msg.innerText = "Server error");
}


/* ================= COMMON AUTH FETCH ================= */
function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    }
  })
  .then(res => {
    if (!res.ok) throw new Error("API Error");
    return res.json();
  })
  .catch(err => {
    console.error(err);
    alert("API error");
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
  });
}


/* ================= TASKS ================= */
function loadTasks() {
  authFetch(`${API_URL}/api/tasks/`)
  .then(tasks => {
    const div = document.getElementById("tasks");

    div.innerHTML = tasks.map(t => `
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
  });
}


/* ================= CREATE TASK ================= */
function createTask() {
  authFetch(`${API_URL}/api/tasks/create/`, {
    method: "POST",
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


/* ================= UPDATE TASK ================= */
function updateStatus(id, status) {
  authFetch(`${API_URL}/api/tasks/${id}/update/`, {
    method: "PUT",
    body: JSON.stringify({ status })
  }).then(() => {
    loadTasks();
    loadDashboard();
  });
}


/* ================= DELETE TASK ================= */
function deleteTask(id) {
  if (!confirm("Delete task?")) return;

  authFetch(`${API_URL}/api/tasks/${id}/delete/`, {
    method: "DELETE"
  }).then(() => {
    loadTasks();
    loadDashboard();
  });
}


/* ================= PROJECTS ================= */
function loadProjects() {
  authFetch(`${API_URL}/api/projects/`)
  .then(data => {
    projectSelect.innerHTML = data.map(p =>
      `<option value="${p.id}">${p.title}</option>`
    ).join("");

    document.getElementById("projectList").innerHTML =
      data.map(p => `
        <div class="task-card">
          ${p.title}
          <button onclick="deleteProject(${p.id})">🗑</button>
        </div>
      `).join("");
  });
}


/* ================= CREATE PROJECT ================= */
function createProject() {
  authFetch(`${API_URL}/api/projects/create/`, {
    method: "POST",
    body: JSON.stringify({
      title: projectTitle.value,
      description: projectDesc.value
    })
  }).then(loadProjects);
}


/* ================= DELETE PROJECT ================= */
function deleteProject(id) {
  if (!confirm("Delete project?")) return;

  authFetch(`${API_URL}/api/projects/${id}/delete/`, {
    method: "DELETE"
  }).then(loadProjects);
}


/* ================= USERS ================= */
function loadUsers() {
  authFetch(`${API_URL}/api/users/`)
  .then(users => {
    assignedUser.innerHTML = users.map(u =>
      `<option value="${u.id}">${u.username}</option>`
    ).join("");

    document.getElementById("userList").innerHTML =
      users.map(u => `
        <div class="task-card">
          <div>
            <b>${u.username}</b><br>
            Role: ${u.role} | Superuser: ${u.is_superuser}
          </div>

          <div>
            <button onclick="makeAdmin(${u.id})">Admin</button>
            <button onclick="deleteUser(${u.id})">🗑</button>
          </div>
        </div>
      `).join("");
  });
}


/* ================= CREATE USER ================= */
function createUser() {
  authFetch(`${API_URL}/api/users/create/`, {
    method: "POST",
    body: JSON.stringify({
      username: newUsername.value,
      password: newPassword.value,
      role: newRole.value,
      is_superuser: isSuperuser.checked
    })
  }).then(loadUsers);
}


/* ================= UPDATE USER ================= */
function makeAdmin(id) {
  authFetch(`${API_URL}/api/users/${id}/update/`, {
    method: "PUT",
    body: JSON.stringify({
      role: "admin",
      is_superuser: true
    })
  }).then(loadUsers);
}


/* ================= DELETE USER ================= */
function deleteUser(id) {
  if (!confirm("Delete user?")) return;

  authFetch(`${API_URL}/api/users/${id}/delete/`, {
    method: "DELETE"
  }).then(loadUsers);
}


/* ================= NAVIGATION ================= */
function showSection(name) {
  document.getElementById("dashboardSection").style.display = name==="dashboard"?"block":"none";
  document.getElementById("projectSection").style.display = name==="projects"?"block":"none";
  document.getElementById("taskSection").style.display = name==="tasks"?"block":"none";
  document.getElementById("userSection").style.display = name==="users"?"block":"none";
}


/* ================= LOGOUT ================= */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}