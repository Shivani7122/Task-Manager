const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev";

// 🔹 LOGIN
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  if (!username || !password) {
    msg.innerText = "Please enter username & password";
    return;
  }

  msg.innerText = "Logging in...";

  fetch(`${API_URL}/api/login/`, {
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
      msg.innerText = "Invalid credentials";
    }
  })
  .catch(() => {
    msg.innerText = "Server error";
  });
}


// 🔹 DASHBOARD DATA
function loadDashboard() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  fetch(`${API_URL}/api/dashboard/`, {
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => {
    if (res.status === 401) {
      logout();
      return;
    }
    return res.json();
  })
  .then(data => {
    if (!data) return;

    document.getElementById("dashboard").innerHTML = `
      <p>📊 Total Tasks: <b>${data.total_tasks}</b></p>
      <p>✅ Completed: <b>${data.completed_tasks}</b></p>
      <p>🕒 Pending: <b>${data.pending_tasks}</b></p>
      <p>⚠ Overdue: <b>${data.overdue_tasks}</b></p>
    `;
  })
  .catch(err => console.error("Dashboard error:", err));
}


// 🔹 LOAD TASKS (UI enhanced)
function loadTasks() {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/api/tasks/`, {
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(tasks => {
    let html = "";

    if (!tasks || tasks.length === 0) {
      html = `<p style="opacity:0.7;">No tasks yet</p>`;
    }

    tasks.forEach(t => {
      html += `
        <li>
          <span>${t.title} - ${t.status}</span>
          ${
            t.status !== "done"
              ? `<button class="done-btn" onclick="markDone(${t.id})">✔</button>`
              : `<span style="color:#00c896;">Done</span>`
          }
        </li>
      `;
    });

    document.getElementById("tasks").innerHTML = html;
  })
  .catch(err => console.error("Tasks error:", err));
}


// 🔹 CREATE TASK
function createTask() {
  const token = localStorage.getItem("token");

  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDesc").value.trim();
  const deadline = document.getElementById("taskDeadline").value;

  if (!title || !description || !deadline) {
    showToast("Please fill all fields");
    return;
  }

  const data = {
    title,
    description,
    deadline,
    status: "pending",
    assigned_to: 1, // later dynamic
    project: 1
  };

  fetch(`${API_URL}/api/create-task/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(() => {
    showToast("Task Created 🚀");

    // Clear fields
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDesc").value = "";
    document.getElementById("taskDeadline").value = "";

    loadTasks();
    loadDashboard();
  })
  .catch(err => console.error("Create error:", err));
}


// 🔹 UPDATE TASK
function markDone(id) {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/api/update-task/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ status: "done" })
  })
  .then(() => {
    showToast("Task Completed ✔");
    loadTasks();
    loadDashboard();
  })
  .catch(err => console.error("Update error:", err));
}


// 🔹 LOGOUT
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}


// 🔹 TOAST (CLASSY UI FEEDBACK)
function showToast(message) {
  const toast = document.createElement("div");
  toast.innerText = message;

  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.background = "#6c63ff";
  toast.style.color = "white";
  toast.style.padding = "10px 15px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 5px 20px rgba(0,0,0,0.3)";
  toast.style.opacity = "0";
  toast.style.transition = "0.4s";

  document.body.appendChild(toast);

  setTimeout(() => (toast.style.opacity = "1"), 100);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 400);
  }, 2000);
}