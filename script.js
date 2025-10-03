// script.js — чистая версия, без дублей. Работает с auth.js (window.__loggedIn и событие 'auth-changed').

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let reminderSound;

// ——— Вспомогательное: проверка авторизации ———
function isLoggedIn() {
  return !!window.__loggedIn || document.body.classList.contains('logged-in');
}

// ——— Добавление задачи ———
function addTask() {
  if (!isLoggedIn()) { alert('Сначала войдите.'); return; }

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

  // очистка формы
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDeadline').value = '';
}

// ——— Рендер списка ———
function renderTasks(filter = "все") {
  const list = document.getElementById('taskList');
  list.innerHTML = '';

  // если гость — просто ничего не показываем (CSS тоже скрывает)
  if (!isLoggedIn()) return;

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

// ——— Смена статуса ———
function changeStatus(id, newStatus) {
  tasks = tasks.map(task => task.id === id ? { ...task, status: newStatus } : task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

// ——— Удаление ———
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

// ——— Фильтр ———
function filterTasks() {
  if (!isLoggedIn()) return;
  const filter = document.getElementById("statusFilter").value;
  renderTasks(filter);
}

// ——— Модалка ———
function openModal() {
  if (!isLoggedIn()) { alert('Сначала войдите.'); return; }
  document.getElementById("taskModal").style.display = "flex";
}
function closeModal() {
  document.getElementById("taskModal").style.display = "none";
}

// ——— Проверка дедлайнов ———
function checkDeadlines() {
  if (!isLoggedIn()) return;

  const now = new Date();
  tasks.forEach(task => {
    const deadline = new Date(task.deadline);
    const diffMs = deadline - now;

    if (task.status !== "выполнена") {
      // напоминание за 5 минут
      if (diffMs > 0 && diffMs < 300000) {
        reminderSound.play().catch(()=>{});
      }
      // дедлайн настал
      if (diffMs <= 0) {
        alert(`⏰ Задача "${task.title}" достигла дедлайна!`);
      }
    }
  });
}

// ——— Тест звука ———
function testSound() {
  if (!isLoggedIn()) { alert('Сначала войдите.'); return; }
  reminderSound.play().catch(err => console.log("Ошибка воспроизведения:", err));
}

// ——— Старт ———
document.addEventListener("DOMContentLoaded", () => {
  reminderSound = new Audio("sound/mixkit-wrong-answer-fail-notification-946.mp3");
  reminderSound.volume = 1.0;

  renderTasks();
  checkDeadlines();
});

// ——— Разрешаем звук после первого клика ———
document.body.addEventListener("click", () => {
  if (!reminderSound) return;
  reminderSound.play().then(() => {
    reminderSound.pause();
    reminderSound.currentTime = 0;
    console.log("🔊 Звук готов к работе");
  }).catch(()=>{});
}, { once: true });

// ——— Реакция на смену авторизации (шлёт auth.js) ———
window.addEventListener('auth-changed', (e) => {
  const loggedIn = !!(e.detail && e.detail.loggedIn);
  if (!loggedIn) closeModal();
  renderTasks();
});

// ——— Таймер обновления (каждые 30 сек) ———
setInterval(() => {
  renderTasks();
  checkDeadlines();
}, 30000);
