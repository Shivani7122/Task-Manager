const API_URL = "https://vigilant-guide-q7px6w69r7rh4q7g-8000.app.github.dev";

/* LOGIN */
function login() {
  const username = usernameInput.value;
  const password = passwordInput.value;

  fetch(`${API_URL}/api/login/`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if(data.access){
      localStorage.setItem("token", data.access);
      window.location.href = "dashboard.html";
    } else {
      msg.innerText = "Login failed";
    }
  })
  .catch(() => msg.innerText = "Server error");
}

/* DASHBOARD */
function loadDashboard() {
  fetch(`${API_URL}/api/dashboard/`, {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") }
  })
  .then(res => res.json())
  .then(d => {
    dashboard.innerHTML = `
      <div>Total<br>${d.total_tasks}</div>
      <div>Completed<br>${d.completed_tasks}</div>
      <div>Pending<br>${d.pending_tasks}</div>
      <div>Overdue<br>${d.overdue_tasks}</div>
    `;
  });
}

/* TASKS */
function loadTasks() {
  fetch(`${API_URL}/api/tasks/`, {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") }
  })
  .then(res => res.json())
  .then(tasks => {
    let html = "";
    tasks.forEach(t => {
      html += `
        <div class="task">
          <span>${t.title} <b class="${t.status}">(${t.status})</b></span>
          <button onclick="updateStatus(${t.id},'done')">✔</button>
        </div>
      `;
    });
    tasksDiv.innerHTML = html;
  });
}

/* USERS */
function loadUsers() {
  fetch(`${API_URL}/api/users/`, {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") }
  })
  .then(res => res.json())
  .then(data => {
    assignedUser.innerHTML = data.map(u =>
      `<option value="${u.id}">${u.username}</option>`
    ).join("");
  });
}

/* PROJECTS */
function loadProjects() {
  fetch(`${API_URL}/api/projects/`, {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") }
  })
  .then(res => res.json())
  .then(data => {
    projectSelect.innerHTML = data.map(p =>
      `<option value="${p.id}">${p.title}</option>`
    ).join("");
  });
}

/* CREATE TASK */
function createTask() {
  fetch(`${API_URL}/api/create-task/`, {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      Authorization:"Bearer "+localStorage.getItem("token")
    },
    body:JSON.stringify({
      title:taskTitle.value,
      description:taskDesc.value,
      status:status.value,
      assigned_to:assignedUser.value,
      project:projectSelect.value,
      deadline:deadline.value
    })
  }).then(()=>{loadTasks();loadDashboard();});
}

/* CREATE PROJECT */
function createProject() {
  fetch(`${API_URL}/api/create-project/`, {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      Authorization:"Bearer "+localStorage.getItem("token")
    },
    body:JSON.stringify({
      title:projectTitle.value,
      description:projectDesc.value
    })
  }).then(()=>loadProjects());
}

/* UPDATE */
function updateStatus(id,status){
  fetch(`${API_URL}/api/update-task/${id}/`,{
    method:"PUT",
    headers:{
      "Content-Type":"application/json",
      Authorization:"Bearer "+localStorage.getItem("token")
    },
    body:JSON.stringify({status})
  }).then(()=>loadTasks());
}

/* NAVIGATION */
function showSection(name){
  dashboardSection.style.display = name==="dashboard"?"block":"none";
  projectSection.style.display = name==="projects"?"block":"none";
  taskSection.style.display = name==="tasks"?"block":"none";
}

/* LOGOUT */
function logout(){
  localStorage.removeItem("token");
  window.location.href="index.html";
}