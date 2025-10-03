let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let reminderSound;
let LOGGED_IN = !!window.__LOGGED_IN__; // может прилететь позже из auth.js

// --- Утилита: показывать/скрывать UI задач, если не вошли ---
function applyAuthVisibility(loggedIn) {
  LOGGED_IN = loggedIn;

  const filterEl = document.getElementById("statusFilter")?.closest(".form-group");
  const testBtn  = document.querySelector('button[onclick="testSound()"]');
  const list     = document.getElementById("taskList");
  const fab      = document.querySelector(".fab");

  const disp = loggedIn ? "" : "none";

  if (filterEl) filterEl.style.display = disp;
  if (testBtn)  testBtn.style.display  = disp;
  if (fab)      fab.style.display      = disp;

  if (list) {
    if (loggedIn) {
      renderTasks();
    } else {
      list.innerHTML = ""; // очищаем, чтобы никто ничего не видел
    }
  }
}

// === Добавление задачи ===
function addTask() {
  if (!LOGGED_IN) { alert("Сначала войдите в систему."); return; }

  const title = document.getElementById('taskTitle').value;
  const deadline = document.getElementById('taskDeadline').value;
  const assignedTo = document.getElementById('assignedTo').value;

  if (!title || !deadline || !assignedTo) {
    alert('Заполните все поля');
    return;
  }

  const task = {
    id: Date.now(),
    title,
    deadline,
    assignedTo,
    createdAt: new Date().toLocaleString("ru-RU"),
    status: 'новая'
  };

  tasks.unshift(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();

  // очистка
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDeadline').value = '';
}

// === Рендер списка ===
function renderTasks(filter = "все") {
  if (!LOGGED_IN) return; // не показываем до входа

  const list = document.getElementById('taskList');
  list.innerHTML = '';
  const now = new Date();

  tasks
    .filter(task => {
      if (filter === "все") return true;
      if (filter === "активные") return task.status !== "выполнена" && new Date(task.deadline) >= now;
      if (filter === "просроченные") return task.status !== "выполнена" && new Date(task.deadline) < now;
      return task.status === filter;
    })
    .forEach(task => {
      const taskCard = document.createElement('div');
      taskCard.className = 'task-card';
      taskCard.innerHTML = `
        <strong>${task.title}</strong><br>
        📌 Создано: ${task.createdAt}<br>
        ⏳ Дедлайн: ${new Date(task.deadline).toLocaleString("ru-RU")}<br>
        👤 Ответственный: ${task.assignedTo}<br>
        Статус:
        <select onchange="changeStatus(${task.id}, this.value)">
          <option ${task.status === 'новая' ? 'selected' : ''}>новая</option>
          <option ${task.status === 'в работе' ? 'selected' : ''}>в работе</option>
          <option ${task.status === 'выполнена' ? 'selected' : ''}>выполнена</option>
        </select>
        <button onclick="deleteTask(${task.id})">Удалить</button>
      `;

      if (new Date(task.deadline) < now && task.status !== 'выполнена') {
        taskCard.classList.add('overdue');
      }
      list.appendChild(taskCard);
    });
}

// === Смена статуса ===
function changeStatus(id, newStatus) {
  if (!LOGGED_IN) return;
  tasks = tasks.map(task => task.id === id ? { ...task, status: newStatus } : task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

// === Удаление ===
function deleteTask(id) {
  if (!LOGGED_IN) return;
  tasks = tasks.filter(task => task.id !== id);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

// === Фильтр ===
function filterTasks() {
  if (!LOGGED_IN) return;
  const filter = document.getElementById("statusFilter").value;
  renderTasks(filter);
}

// === Модалка ===
function openModal() {
  if (!LOGGED_IN) { alert("Войдите, чтобы добавлять задачи."); return; }
  document.getElementById("taskModal").style.display = "flex";
}
function closeModal() {
  document.getElementById("taskModal").style.display = "none";
}

// === Проверка дедлайнов ===
function checkDeadlines() {
  if (!LOGGED_IN) return;
  const now = new Date();
  tasks.forEach(task => {
    const deadline = new Date(task.deadline);
    const diffMs = deadline - now;

    if (task.status !== "выполнена") {
      if (diffMs > 0 && diffMs < 300000) {
        reminderSound.play().catch(()=>{
