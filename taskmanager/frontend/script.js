const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev"; 

// 🔹 LOGIN
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  if (!username || !password) {
    msg.innerText = "Please enter username and password";
    return;
  }

  msg.innerText = "Logging in...";

  fetch(`${API_URL}/api/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Login response:", data);

    if (data.access) {
      localStorage.setItem("token", data.access);
      window.location.href = "dashboard.html";
    } else {
      msg.innerText = "Invalid credentials";
    }
  })
  .catch(err => {
    console.error("Login error:", err);
    msg.innerText = "Server error";
  });
}


// 🔹 DASHBOARD
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
      <p><b>Total:</b> ${data.total_tasks}</p>
      <p><b>Completed:</b> ${data.completed_tasks}</p>
      <p><b>Pending:</b> ${data.pending_tasks}</p>
      <p><b>Overdue:</b> ${data.overdue_tasks}</p>
    `;
  })
  .catch(err => console.error("Dashboard error:", err));
}


// 🔹 TASKS
function loadTasks() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  fetch(`${API_URL}/api/tasks/`, {
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
  .then(tasks => {
    if (!tasks) return;

    let html = "";
    tasks.forEach(t => {
      html += `
        <li>
          <b>${t.title}</b> - ${t.status}
        </li>
      `;
    });

    document.getElementById("tasks").innerHTML = html;
  })
  .catch(err => console.error("Tasks error:", err));
}


// 🔹 LOGOUT
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}