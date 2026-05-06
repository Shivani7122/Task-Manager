const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev";

/* ================= LOGIN ================= */

async function login() {

  const username =
    document.getElementById("username").value.trim();

  const password =
    document.getElementById("password").value.trim();

  const role = document.querySelector(
    'input[name="role"]:checked'
  )?.value;

  const msg = document.getElementById("msg");

  const btn = document.querySelector("button");

  if (!username || !password || !role) {

    msg.innerText = "Fill all fields ❌";

    return;
  }

  btn.innerHTML = "Loading...";

  btn.disabled = true;

  try {

    const response = await fetch(
      `${API_URL}/api/auth/login/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          username,
          password
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      msg.innerText =
        data.detail || "Invalid credentials ❌";

      return;
    }

    localStorage.setItem(
      "token",
      data.access
    );

    const userResponse = await fetch(
      `${API_URL}/api/users/`,
      {
        headers: {
          "Authorization":
            "Bearer " + data.access
        }
      }
    );

    const users = await userResponse.json();

    const user = users.find(
      u =>
      u.username.toLowerCase() ===
      username.toLowerCase()
    );

    if (!user) {

      msg.innerText = "User not found ❌";

      return;
    }

    localStorage.setItem(
      "role",
      user.role.toLowerCase()
    );

    localStorage.setItem(
      "user_id",
      user.id
    );

    msg.innerText = "Login successful ✅";

    setTimeout(() => {

      window.location.href =
        "dashboard.html";

    }, 1000);

  }

  catch (error) {

    console.error(error);

    msg.innerText = "Server error ❌";
  }

  finally {

    btn.innerHTML = "Login";

    btn.disabled = false;
  }
}

/* ================= INIT ================= */

function initApp() {

  const token =
    localStorage.getItem("token");

  const role =
    localStorage.getItem("role");

  if (!token) {

    window.location.href =
      "index.html";

    return;
  }

  // MEMBER RESTRICTIONS
  if (role === "member") {

    document.getElementById(
      "projectSection"
    ).style.display = "none";

    document.getElementById(
      "userSection"
    ).style.display = "none";

    document.getElementById(
      "createTaskBox"
    ).style.display = "none";
  }

  loadUsers();

  loadProjects();

  loadTasks();

  loadDashboard();

  showSection("dashboard");
}

/* ================= DASHBOARD ================= */

function loadDashboard() {

  const container =
    document.getElementById("dashboard");

  const role =
    localStorage.getItem("role");

  const userId =
    localStorage.getItem("user_id");

  container.innerHTML =
    `<div class="loader"></div>`;

  fetch(`${API_URL}/api/tasks/`, {
    headers: authHeader()
  })

  .then(res => res.json())

  .then(tasks => {

    let filtered =
      role === "member"
      ? tasks.filter(
          t => t.assigned_to == userId
        )
      : tasks;

    const total =
      filtered.length;

    const pending =
      filtered.filter(
        t => t.status === "pending"
      ).length;

    const progress =
      filtered.filter(
        t => t.status === "in_progress"
      ).length;

    const done =
      filtered.filter(
        t => t.status === "done"
      ).length;

    container.innerHTML = `

      <div class="grid">

        <div>
          📌 Total: ${total}
        </div>

        <div>
          ⏳ Pending: ${pending}
        </div>

        <div>
          🚀 In Progress: ${progress}
        </div>

        <div>
          ✅ Completed: ${done}
        </div>

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

    const assigned =
      document.getElementById(
        "assignedUser"
      );

    if (assigned) {

      assigned.innerHTML =

        `<option value="">
          Select User
        </option>`

        +

        users.map(u => `

          <option value="${u.id}">

            👤 ${u.username}
            (${u.role})

          </option>

        `).join("");
    }

    const list =
      document.getElementById(
        "usersList"
      );

    if (list) {

      list.innerHTML = users.map(u => `

        <div class="card-item">

          <div>

            <b>${u.username}</b>

            (${u.role})

          </div>

          ${localStorage.getItem("role")
            === "admin"

            ?

            `<button
              onclick="deleteUser(${u.id})"
            >
              ❌
            </button>`

            :

            ""
          }

        </div>

      `).join("");
    }
  });
}

/* ================= PROJECTS ================= */

function loadProjects() {

  const container =
    document.getElementById(
      "projectList"
    );

  container.innerHTML =
    `<div class="loader"></div>`;

  fetch(`${API_URL}/api/projects/`, {
    headers: authHeader()
  })

  .then(res => res.json())

  .then(data => {

    const role =
      localStorage.getItem("role");

    container.innerHTML =
      data.map(p => `

      <div class="card-item">

        <div>

          <b>${p.title}</b><br>

          <small>
            ${p.description || ""}
          </small>

        </div>

        ${role === "admin"

          ?

          `<button
            onclick="deleteProject(${p.id})"
          >
            ❌
          </button>`

          :

          ""
        }

      </div>

    `).join("");

    const dropdown =
      document.getElementById(
        "projectSelect"
      );

    if (dropdown) {

      dropdown.innerHTML =

        `<option value="">
          Select Project
        </option>`

        +

        data.map(p => `

          <option value="${p.id}">

            📦 ${p.title}

          </option>

        `).join("");
    }
  });
}

/* ================= CREATE PROJECT ================= */

function createProject() {

  const title =
    document.getElementById(
      "projectTitle"
    ).value.trim();

  const description =
    document.getElementById(
      "projectDescription"
    ).value.trim();

  if (!title) {

    alert("Enter project title");

    return;
  }

  fetch(
    `${API_URL}/api/projects/create/`,
    {
      method: "POST",

      headers: {

        "Content-Type":
          "application/json",

        ...authHeader()
      },

      body: JSON.stringify({
        title,
        description
      })
    }
  )

  .then(res => res.json())

  .then(data => {

    console.log(data);

    document.getElementById(
      "projectTitle"
    ).value = "";

    document.getElementById(
      "projectDescription"
    ).value = "";

    loadProjects();
  });
}

/* ================= CREATE USER ================= */

function createUser() {

  const username =
    document.getElementById(
      "newUsername"
    ).value.trim();

  const password =
    document.getElementById(
      "newPassword"
    ).value.trim();

  const role =
    document.getElementById(
      "newRole"
    ).value;

  if (!username || !password) {

    alert("Fill all fields");

    return;
  }

  fetch(
    `${API_URL}/api/users/create/`,
    {
      method: "POST",

      headers: {

        "Content-Type":
          "application/json",

        ...authHeader()
      },

      body: JSON.stringify({
        username,
        password,
        role
      })
    }
  )

  .then(res => res.json())

  .then(data => {

    console.log(data);

    document.getElementById(
      "newUsername"
    ).value = "";

    document.getElementById(
      "newPassword"
    ).value = "";

    loadUsers();
  });
}

/* ================= CREATE TASK ================= */

function createTask() {

  const title =
    document.getElementById(
      "taskTitle"
    ).value.trim();

  const description =
    document.getElementById(
      "taskDescription"
    ).value.trim();

  const project =
    document.getElementById(
      "projectSelect"
    ).value;

  const assigned_to =
    document.getElementById(
      "assignedUser"
    ).value;

  const deadline =
    document.getElementById(
      "deadline"
    ).value;

  if (!title || !project || !assigned_to) {

    alert("Fill all fields");

    return;
  }

  fetch(
    `${API_URL}/api/tasks/create/`,
    {
      method: "POST",

      headers: {

        "Content-Type":
          "application/json",

        ...authHeader()
      },

      body: JSON.stringify({
        title,
        description,
        project,
        assigned_to,
        deadline
      })
    }
  )

  .then(res => res.json())

  .then(data => {

    console.log(data);

    document.getElementById(
      "taskTitle"
    ).value = "";

    document.getElementById(
      "taskDescription"
    ).value = "";

    document.getElementById(
      "deadline"
    ).value = "";

    loadTasks();

    loadDashboard();
  });
}

/* ================= UPDATE TASK ================= */

function updateTask(taskId, status) {

  fetch(
    `${API_URL}/api/tasks/update/${taskId}/`,
    {
      method: "PATCH",

      headers: {

        "Content-Type":
          "application/json",

        ...authHeader()
      },

      body: JSON.stringify({
        status
      })
    }
  )

  .then(res => res.json())

  .then(data => {

    console.log(data);

    loadTasks();

    loadDashboard();
  });
}

/* ================= DELETE TASK ================= */

function deleteTask(id) {

  fetch(
    `${API_URL}/api/tasks/delete/${id}/`,
    {
      method: "DELETE",

      headers: authHeader()
    }
  )

  .then(() => {

    loadTasks();

    loadDashboard();
  });
}

/* ================= DELETE PROJECT ================= */

function deleteProject(id) {

  fetch(
    `${API_URL}/api/projects/delete/${id}/`,
    {
      method: "DELETE",

      headers: authHeader()
    }
  )

  .then(() => {

    loadProjects();
  });
}

/* ================= DELETE USER ================= */

function deleteUser(id) {

  fetch(
    `${API_URL}/api/users/delete/${id}/`,
    {
      method: "DELETE",

      headers: authHeader()
    }
  )

  .then(() => {

    loadUsers();
  });
}

/* ================= TASKS ================= */

function loadTasks() {

  const container =
    document.getElementById(
      "tasksDiv"
    );

  container.innerHTML =
    `<div class="loader"></div>`;

  fetch(`${API_URL}/api/tasks/`, {
    headers: authHeader()
  })

  .then(res => res.json())

  .then(tasks => {

    const role =
      localStorage.getItem("role");

    const userId =
      localStorage.getItem("user_id");

    let filtered =
      role === "member"

      ? tasks.filter(
          t => t.assigned_to == userId
        )

      : tasks;

    container.innerHTML =
      filtered.map(t => `

      <div class="task-card">

        <h4>${t.title}</h4>

        <p>
          ${t.description || ""}
        </p>

        <small>

          👤 ${t.assigned_to_username}

          |

          📦 ${t.project_title}

        </small>

        <div class="status ${t.status}">

          ${formatStatus(t.status)}

        </div>

        <select
          onchange="updateTask(${t.id}, this.value)"
        >

          <option
            value="pending"
            ${t.status === "pending"
              ? "selected"
              : ""
            }
          >
            Pending
          </option>

          <option
            value="in_progress"
            ${t.status === "in_progress"
              ? "selected"
              : ""
            }
          >
            In Progress
          </option>

          <option
            value="done"
            ${t.status === "done"
              ? "selected"
              : ""
            }
          >
            Completed
          </option>

        </select>

        ${role === "admin"

          ?

          `<button
            onclick="deleteTask(${t.id})"
          >
            ❌
          </button>`

          :

          ""
        }

      </div>

    `).join("");
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
      "Bearer " +
      localStorage.getItem("token")
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

    document.getElementById(id)
      .style.display = "none";
  });

  document.getElementById(
    sections[name]
  ).style.display = "block";
}

/* ================= LOGOUT ================= */

function logout() {

  localStorage.clear();

  window.location.href =
    "index.html";
}