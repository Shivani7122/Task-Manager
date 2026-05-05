const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev";

let currentUser = null;

/* LOGIN */
function login() {
  const username = document.getElementById("usernameInput").value;
  const password = document.getElementById("passwordInput").value;
  const msg = document.getElementById("msg");

  fetch(`${API_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.access) {
        localStorage.setItem("token", data.access);
        window.location.href = "dashboard.html";
      } else {
        msg.innerText = "Invalid username or password";
      }
    })
    .catch(() => {
      msg.innerText = "Server error";
    });
}

/* INIT */
function initApp() {
  if (!localStorage.getItem("token")) {
    window.location.href = "index.html";
    return;
  }

  loadUsers();      // 🔥 IMPORTANT
  loadProjects();
  loadTasks();
  loadDashboard();
}

/* DASHBOARD */
function loadDashboard() {
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

/* USERS */
function loadUsers() {
  fetch(`${API_URL}/api/users/`, {
    headers: authHeader()
  })
  .then(res => res.json())
  .then(users => {
    console.log("USERS:", users);

    // 🔽 DROPDOWN (Assigned To)
    const dropdown = document.getElementById("assignedUser");
    if (dropdown) {
      dropdown.innerHTML = users.map(u =>
        `<option value="${u.id}">${u.username}</option>`
      ).join("");
    }

    // 🔽 USER LIST (Admin panel)
    const list = document.getElementById("usersList");
    if (list) {
      list.innerHTML = users.map(u => `
        <div class="card-item">
          <div>
            <b>${u.username}</b> (${u.role})
            <br>
            Active: ${u.is_active ? "Yes" : "No"} |
            Superuser: ${u.is_superuser ? "Yes" : "No"}
          </div>

          <div>
            <button onclick="deleteUser(${u.id})">❌</button>
          </div>
        </div>
      `).join("");
    }
  })
  .catch(err => console.error("USER LOAD ERROR:", err));
}

/* PROJECTS */
function loadProjects() {
  fetch(`${API_URL}/api/projects/`, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
  .then(res => res.json())
  .then(data => {

    const container = document.getElementById("projectList");
    container.innerHTML = "";

    data.forEach(project => {
      container.innerHTML += `
        <div class="list-item">
          <span>${project.title}</span>

          <button class="delete-btn"
            onclick="deleteProject(${project.id})">
            ❌
          </button>
        </div>
      `;
    });
  });
}

/* TASKS */
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

/* CREATE TASK */
function createTask() {
  const data = {
    title: document.getElementById("taskTitle").value,
    description: document.getElementById("taskDesc").value,
    status: document.getElementById("status").value,
    assigned_to: document.getElementById("assignedUser").value,
    project: document.getElementById("projectSelect").value,
    deadline: document.getElementById("deadline").value
  };

  console.log("CREATE TASK DATA:", data); // 🔥 DEBUG

  fetch(`${API_URL}/api/tasks/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader()
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(res => {
      console.log("TASK RESPONSE:", res);
      loadTasks();
    });
}

/* UPDATE TASK */
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

/* DELETE TASK */
function deleteTask(id) {
  fetch(`${API_URL}/api/tasks/${id}/delete/`, {
    method: "DELETE",
    headers: authHeader()
  }).then(loadTasks);
}

/* CREATE PROJECT */
function createProject() {
  const title = document.getElementById("projectTitle").value;
  const description = document.getElementById("projectDesc").value;

  if (!title || !description) {
    alert("Fill all fields");
    return;
  }

  fetch(`${API_URL}/api/projects/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      title: title,
      description: description
    })
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) {
      console.error("ERROR:", data);
      throw new Error(JSON.stringify(data));
    }

    return data;
  })
  .then(() => {
    alert("Project created ✅");
    loadProjects();
  })
  .catch(err => {
    console.error("CREATE ERROR:", err);
    alert("Backend error — check console ❌");
  });
}
/* DELETE PROJECT */
function deleteProject(id) {

  if (!confirm("Delete this project?")) return;

  fetch(`${API_URL}/api/projects/${id}/delete/`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
  .then(res => {
    if (res.status === 204) {
      alert("Deleted ✅");
      loadProjects(); // refresh
    } else {
      throw new Error("Delete failed");
    }
  })
  .catch(err => {
    console.error("DELETE ERROR:", err);
    alert("Error deleting project ❌");
  });
}

/* CREATE USER */
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

/* DELETE USER */
function deleteUser(id) {
  fetch(`${API_URL}/api/users/${id}/delete/`, {
    method: "DELETE",
    headers: authHeader()
  }).then(loadUsers);
}

/* AUTH */
function authHeader() {
  return {
    Authorization: "Bearer " + localStorage.getItem("token")
  };
}

/* NAV */
function showSection(name) {
  dashboardSection.style.display = name === "dashboard" ? "block" : "none";
  projectSection.style.display = name === "projects" ? "block" : "none";
  taskSection.style.display = name === "tasks" ? "block" : "none";
  userSection.style.display = name === "users" ? "block" : "none";
}

/* LOGOUT */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}