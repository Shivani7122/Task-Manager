const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev";

// 🔹 Dashboard
function loadDashboard() {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/api/dashboard/`, {
    headers: { Authorization: "Bearer " + token }
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("dashboard").innerHTML = `
      <div>Total: ${data.total_tasks}</div>
      <div>Completed: ${data.completed_tasks}</div>
      <div>Pending: ${data.pending_tasks}</div>
      <div>Overdue: ${data.overdue_tasks}</div>
    `;
  });
}

// 🔹 Load Tasks
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
          <span>${t.title} (${t.status})</span>
          <button onclick="markDone(${t.id})">✔</button>
        </div>
      `;
    });

    document.getElementById("tasks").innerHTML = html;
  });
}

// 🔹 Create Task
function createTask() {
  const token = localStorage.getItem("token");

  const data = {
    title: taskTitle.value,
    description: taskDesc.value,
    status: status.value,
    assigned_to: assignedUser.value,
    project: projectSelect.value,
    deadline: deadline.value
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
  });
}

// 🔹 Create Project
function createProject() {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/api/create-project/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      title: projectTitle.value,
      description: projectDesc.value
    })
  })
  .then(() => loadProjects());
}

// 🔹 Load Users (dropdown)
function loadUsers() {
  const select = document.getElementById("assignedUser");

  // TEMP static (later API bana sakte ho)
  select.innerHTML = `
    <option value="1">Admin</option>
    <option value="2">Member</option>
  `;
}

// 🔹 Load Projects
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
    projectSelect.innerHTML = html;
  });
}

// 🔹 Update
function markDone(id) {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/api/update-task/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ status: "done" })
  }).then(() => loadTasks());
}

// 🔹 Section switch
function showSection(name) {
  dashboardSection.style.display = name === "dashboard" ? "block" : "none";
  projectSection.style.display = name === "projects" ? "block" : "none";
  taskSection.style.display = name === "tasks" ? "block" : "none";
}

// 🔹 Logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}