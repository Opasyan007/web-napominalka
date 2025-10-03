// script.js — задачи + UI, без повторной инициализации Firebase
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const auth = getAuth(); // берём auth, созданный в auth.js

// ---------- сохраняем сессию между перезагрузками ----------
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log("[script] persistence set: localStorage");
  } catch (e) {
    console.error("[script] setPersistence error:", e);
  }
})();

// ---------- элементы интерфейса ----------
const authSection   = document.getElementById("authSection");
const statusFilterEl= document.getElementById("statusFilter");
const taskListEl    = document.getElementById("taskList");

// ---------- локальное хранение задач (по пользователю) ----------
let tasks = [];
let reminderSound = null;
let deadlinesTimer = null;

function storageKey() {
  const uid = auth.currentUser?.uid || "guest";
  return `tasks_${uid}`;
}
function loadTasks()   { tasks = JSON.parse(localStorage.getItem(storageKey())) || []; }
function saveTasks()   { localStorage.setItem(storageKey(), JSON.stringify(tasks)); }
function requireAuth() {
  if (!auth.currentUser) { alert("Сначала войдите в систему"); return false; }
  return true;
}

// ---------- ЛОГИКА ЗАДАЧ ----------
function addTask() {
  if (!requireAuth()) return;

  const titleEl      = document.getElementById('taskTitle');
  const deadlineEl   = document.getElementById('taskDeadline');
  const assignedToEl = document.getElementById('assignedTo');

  const title = titleEl.value.trim();
  const deadline = deadlineEl.value;
  const assignedTo = assignedToEl.value.trim();

  if (!title || !deadline || !assignedTo || assignedTo === 'Не выбрано') {
    alert('Заполните все поля');
    return;
  }

  const task = {
    id: Date.now(),
    title,
    deadline, // ISO из <input type="datetime-local">
    assignedTo,
    createdAt: new Date().toLocaleString('ru-RU'),
    status: 'новая',
  };

  tasks.unshift(task);
  saveTasks();
  renderTasks();

  titleEl.value = '';
  deadlineEl.value = '';
}

function renderTasks(filter = 'все') {
  const now = new Date();
  taskListEl.innerHTML = '';

  tasks
    .filter(t => {
      if (filter === 'все') return true;
      if (filter === 'активные') return t.status !== 'выполнена' && new Date(t.deadline) >= now;
      if (filter === 'просроченные') return t.status !== 'выполнена' && new Date(t.deadline) < now;
      return t.status === filter;
    })
    .forEach(t => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.innerHTML = `
        <strong>${t.title}</strong><br>
        📌 Создано: ${t.createdAt}<br>
        ⏳ Дедлайн: ${new Date(t.deadline).toLocaleString('ru-RU')}<br>
        👤 Ответственный: ${t.assignedTo}<br>
        Статус:
        <select onchange="changeStatus(${t.id}, this.value)">
          <option ${t.status === 'новая' ? 'selected' : ''}>новая</option>
          <option ${t.status === 'в работе' ? 'selected' : ''}>в работе</option>
          <option ${t.status === 'выполнена' ? 'selected' : ''}>выполнена</option>
        </select>
        <button onclick="deleteTask(${t.id})">Удалить</button>
      `;
      if (new Date(t.deadline) < now && t.status !== 'выполнена') {
        card.classList.add('overdue');
      }
      taskListEl.appendChild(card);
    });
}

function changeStatus(id, status) {
  if (!requireAuth()) return;
  tasks = tasks.map(t => (t.id === id ? { ...t, status } : t));
  saveTasks();
  renderTasks(statusFilterEl?.value ?? 'все');
}

function deleteTask(id) {
  if (!requireAuth()) return;
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks(statusFilterEl?.value ?? 'все');
}

function filterTasks() {
  renderTasks(statusFilterEl.value);
}

// ---------- МОДАЛКА (объявляем ОДИН раз) ----------
function openModal() {
  if (!requireAuth()) return;
  const m = document.getElementById('taskModal');
  if (m) { m.style.display = 'flex'; }
}
function closeModal() {
  const m = document.getElementById('taskModal');
  if (m) { m.style.display = 'none'; }
}

// ---------- дедлайны + звук ----------
function checkDeadlines() {
  const now = new Date();
  tasks.forEach(t => {
    if (t.status === 'выполнена') return;
    const dl = new Date(t.deadline);
    const diff = dl - now;
    if (diff > 0 && diff < 5 * 60 * 1000 && reminderSound) {
      reminderSound.play().catch(() => {});
    }
    if (diff <= 0) {
      alert(`⏰ Задача "${t.title}" достигла дедлайна!`);
    }
  });
}
function testSound() {
  reminderSound?.play().catch(() => {});
}

// ---------- DOM готов ----------
document.addEventListener('DOMContentLoaded', () => {
  // звук
  reminderSound = new Audio('sound/mixkit-wrong-answer-fail-notification-946.mp3');
  reminderSound.volume = 1.0;
  document.body.addEventListener('click', () => {
    reminderSound.play().then(() => {
      reminderSound.pause(); reminderSound.currentTime = 0;
    }).catch(() => {});
  }, { once: true });

  // первый рендер (пусто, если не залогинен)
  renderTasks();
});

// ---------- реакция на вход/выход ----------
onAuthStateChanged(auth, (user) => {
  if (authSection) authSection.style.display = user ? "none" : "block";

  if (user) {
    loadTasks();
    renderTasks(statusFilterEl?.value ?? 'все');

    if (deadlinesTimer) clearInterval(deadlinesTimer);
    deadlinesTimer = setInterval(() => {
      renderTasks(statusFilterEl?.value ?? 'все');
      checkDeadlines();
    }, 30000);
  } else {
    if (deadlinesTimer) clearInterval(deadlinesTimer);
    taskListEl.innerHTML = "";
  }
});

// ---------- ДЕЛАЕМ ФУНКЦИИ ДОСТУПНЫМИ ДЛЯ HTML (onclick/онchange) ----------
window.openModal    = openModal;
window.closeModal   = closeModal;
window.addTask      = addTask;
window.deleteTask   = deleteTask;
window.changeStatus = changeStatus;
window.filterTasks  = filterTasks;
window.testSound    = testSound;
