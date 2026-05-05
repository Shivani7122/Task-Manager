const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev"; 

// 🔹 LOGIN
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch(`${API_URL}/api/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    console.log(data);

    if (data.access) {
      localStorage.setItem("token", data.access);
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("msg").innerText = "Login failed";
    }
  })
  .catch(err => console.error("Login error:", err));
}


// 🔹 DASHBOARD
function loadDashboard() {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/api/dashboard/`, {
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("dashboard").innerHTML = `
      <p>Total: ${data.total_tasks}</p>
      <p>Completed: ${data.completed_tasks}</p>
      <p>Pending: ${data.pending_tasks}</p>
      <p>Overdue: ${data.overdue_tasks}</p>
    `;
  })
  .catch(err => console.error("Dashboard error:", err));
}


// 🔹 TASKS
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
    tasks.forEach(t => {
      html += `<li>${t.title} - ${t.status}</li>`;
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