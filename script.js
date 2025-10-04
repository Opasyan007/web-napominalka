// ====== Память/данные ======
const TASKS_KEY = 'tasks';
const ASSIGNEES_KEY = 'assignees';

// Дефолтный список (один раз положится в localStorage, дальше — вы управляете сами)
const DEFAULT_ASSIGNEES = [
  "Ахметзянов Р.И.","Кузьмина Е.П.","Галимов А.И.","Смирнов П.С.","Шарипова Л.Н.",
  "Иванов А В.","Зайнуллин И.М.","Васильева Н.В.","Миннахметова А.И.","Сафин Б.Р.",
  "Николаева Д.А.","Егоров Н.Д.","Мухаметзянова Д. Р.","Попов М.И.","Хасанова Г.К."
];

let tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
let assignees = JSON.parse(localStorage.getItem(ASSIGNEES_KEY)) || DEFAULT_ASSIGNEES.slice();
let reminderSound;

// ====== Утилиты ======
function saveTasks(){ localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }
function saveAssignees(){ localStorage.setItem(ASSIGNEES_KEY, JSON.stringify(assignees)); }
function isLoggedIn(){ return document.body.classList.contains('logged-in'); }

// ====== Рендер выпадашки "Ответственный" ======
function renderAssigneeSelect() {
  const sel = document.getElementById('assignedTo');
  if (!sel) return;
  sel.innerHTML = '';
  const optEmpty = new Option('Не выбрано', '');
  sel.appendChild(optEmpty);
  assignees.forEach(name => sel.appendChild(new Option(name, name)));
}

// ====== Управление ответственными ======
function openAssigneesModal(){
  renderAssigneesList();
  document.getElementById('assigneesModal').style.display = 'flex';
}
function closeAssigneesModal(){
  document.getElementById('assigneesModal').style.display = 'none';
  renderAssigneeSelect(); // на случай изменений
}

function addAssignee(name) {
  const n = (name || '').trim();
  if (!n) return alert('Введите ФИО');
  // защита от дублей (без учёта регистра и лишних пробелов)
  const exists = assignees.some(a => a.replace(/\s+/g,' ').trim().toLowerCase() === n.toLowerCase());
  if (exists) return alert('Такой человек уже есть в списке');
  assignees.push(n);
  saveAssignees();
  renderAssigneesList();
  renderAssigneeSelect();
}

function removeAssigneeByIndex(idx){
  assignees.splice(idx,1);
  saveAssignees();
  renderAssigneesList();
  renderAssigneeSelect();
}

function renderAssigneesList(){
  const box = document.getElementById('assigneesList');
  box.innerHTML = '';
  if (!assignees.length){
    box.innerHTML = '<div class="empty">Список пуст. Добавьте первого ответственного.</div>';
    return;
  }
  assignees.forEach((name, i) => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = `<span>${name}</span><button class="chip-del" data-idx="${i}" title="Удалить">×</button>`;
    box.appendChild(chip);
  });
}

// делегирование на список чипов
document.addEventListener('click', (e) => {
  if (e.target && e.target.classList.contains('chip-del')) {
    const idx = +e.target.dataset.idx;
    removeAssigneeByIndex(idx);
  }
});

// кнопки управления модалкой ответственных
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnManageAssignees')?.addEventListener('click', openAssigneesModal);
  document.getElementById('btnAddAssignee')?.addEventListener('click', () => {
    addAssignee(document.getElementById('assigneeInput').value);
    document.getElementById('assigneeInput').value = '';
    document.getElementById('assigneeInput').focus();
  });
});

// ====== Задачи ======
function addTask() {
  if (!isLoggedIn()) { alert('Сначала войдите.'); return; }

  const title = document.getElementById('taskTitle').value.trim();
  const deadline = document.getElementById('taskDeadline').value;
  const assignedTo = document.getElementById('assignedTo').value;

  if (!title || !deadline || !assignedTo) {
    alert('Заполните все поля и выберите ответственного');
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
  saveTasks();
  renderTasks();

  // очистка
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDeadline').value = '';
  document.getElementById('assignedTo').value = '';
}

function renderTasks(filter = "все") {
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

function changeStatus(id, newStatus) {
  tasks = tasks.map(task => task.id === id ? { ...task, status: newStatus } : task);
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function filterTasks() {
  const filter = document.getElementById("statusFilter").value;
  renderTasks(filter);
}

// ====== Модалки ======
function openModal() {
  if (!isLoggedIn()) { alert('Сначала войдите.'); return; }
  document.getElementById("taskModal").style.display = "flex";
}
function closeModal() {
  document.getElementById("taskModal").style.display = "none";
}
function closeAssigneesModal(){
  document.getElementById("assigneesModal").style.display = "none";
}

// ====== Дедлайны/звук ======
function checkDeadlines() {
  if (!isLoggedIn()) return;
  const now = new Date();
  tasks.forEach(task => {
    const deadline = new Date(task.deadline);
    const diffMs = deadline - now;
    if (task.status !== "выполнена") {
      if (diffMs > 0 && diffMs < 300000) {
        reminderSound.play().catch(()=>{});
      }
      if (diffMs <= 0) {
        alert(`⏰ Задача "${task.title}" достигла дедлайна!`);
      }
    }
  });
}

function testSound() {
  if (!isLoggedIn()) { alert('Сначала войдите.'); return; }
  reminderSound.play().catch(err => console.log("Ошибка воспроизведения:", err));
}

// ====== Старт ======
document.addEventListener("DOMContentLoaded", () => {
  // звук
  reminderSound = new Audio("sound/mixkit-wrong-answer-fail-notification-946.mp3");
  reminderSound.volume = 1.0;

  // подготовка списка ответственных + выпадашка
  saveAssignees();          // зафиксируем дефолт в localStorage при первом запуске
  renderAssigneeSelect();

  renderTasks();
  checkDeadlines();

  // Разрешаем звук после первого клика
  document.body.addEventListener("click", () => {
    reminderSound.play().then(() => {
      reminderSound.pause();
      reminderSound.currentTime = 0;
      console.log("🔊 Звук готов к работе");
    }).catch(()=>{});
  }, { once: true });
});

// реакция на смену авторизации от auth.js
window.addEventListener('auth-changed', () => {
  renderTasks();
});

// таймер
setInterval(() => {
  renderTasks();
  checkDeadlines();
}, 30000);

// Экспорт ф-ций в глобал (для inline-обработчиков)
window.addTask = addTask;
window.changeStatus = changeStatus;
window.deleteTask = deleteTask;
window.filterTasks = filterTasks;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeAssigneesModal = closeAssigneesModal;
