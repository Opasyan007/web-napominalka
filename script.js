// Храним задачи в localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Звук напоминания (инициализируем после первого клика из-за ограничений браузера)
let reminderSound;

// Короткая утилита для сохранения списка
function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Добавить задачу из формы
function addTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const deadline = document.getElementById('taskDeadline').value;
  const assignedTo = document.getElementById('assignedTo').value.trim();

  if (!title || !deadline || !assignedTo) {
    alert('Заполните все поля');
    return;
  }

  const task = {
    id: Date.now(),
    title,
    deadline,                           // ISO-строка из input[type=datetime-local]
    assignedTo,
    createdAt: new Date().toLocaleString('ru-RU'),
    status: 'новая'
  };

  tasks.unshift(task);
  save();
  renderTasks();

  // Очистка полей
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDeadline').value = '';
}

// Показать список (с фильтром по статусу)
function renderTasks(filter = 'все') {
  const list = document.getElementById('taskList');
  const now = new Date();
  list.innerHTML = '';

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

      // Подсветка просрочки
      if (new Date(t.deadline) < now && t.status !== 'выполнена') {
        card.classList.add('overdue');
      }

      list.appendChild(card);
    });
}

// Сменить статус задачи
function changeStatus(id, status) {
  tasks = tasks.map(t => (t.id === id ? { ...t, status } : t));
  save();
  renderTasks();
}

// Удалить задачу
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  renderTasks();
}

// Применить фильтр из select
function filterTasks() {
  const value = document.getElementById('statusFilter').value;
  renderTasks(value);
}

// Открыть/закрыть модалку
function openModal()  { document.getElementById('taskModal').style.display = 'flex'; }
function closeModal() { document.getElementById('taskModal').style.display = 'none'; }

// Проверка сроков: напоминание за 5 минут и алерт в момент дедлайна
function checkDeadlines() {
  const now = new Date();

  tasks.forEach(t => {
    if (t.status === 'выполнена') return;

    const dl = new Date(t.deadline);
    const diff = dl - now;

    // За 5 минут до дедлайна — короткий звук
    if (diff > 0 && diff < 5 * 60 * 1000 && reminderSound) {
      reminderSound.play().catch(() => {});
    }

    // В момент дедлайна — всплывающее уведомление
    if (diff <= 0) {
      alert(`⏰ Задача "${t.title}" достигла дедлайна!`);
    }
  });
}

// Проверка звука вручную (по кнопке)
function testSound() {
  reminderSound?.play().catch(err => console.log('Ошибка воспроизведения:', err));
}

// Готовим всё после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
  // Загружаем звук (активируется после первого клика)
  reminderSound = new Audio('sound/mixkit-wrong-answer-fail-notification-946.mp3');
  reminderSound.volume = 1.0;

  renderTasks();
  checkDeadlines();
});

// Разрешаем проигрывать аудио после первого взаимодействия пользователя
document.body.addEventListener('click', () => {
  reminderSound.play().then(() => {
    reminderSound.pause();
    reminderSound.currentTime = 0;
  }).catch(() => {});
}, { once: true });

// Периодическое обновление
setInterval(() => {
  renderTasks();
  checkDeadlines();
}, 30000);
// ====== МОДАЛКА (надёжно) ======
function openModal() {
  if (!requireAuth()) return;
  const m = document.getElementById('taskModal');
  if (m) { m.classList.add('show'); m.style.display = 'flex'; }
}
function closeModal() {
  const m = document.getElementById('taskModal');
  if (m) { m.classList.remove('show'); m.style.display = 'none'; }
}

// Привязываем клики через JS (чтобы не зависеть от inline-обработчиков)
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('fabAdd')?.addEventListener('click', openModal);

  // Сохранить/Отмена в модалке — два варианта (работают оба):
  document.getElementById('btnSave')?.addEventListener('click', () => { 
    addTask(); 
    closeModal(); 
  });
  document.getElementById('btnCancel')?.addEventListener('click', closeModal);
});

// ====== СДЕЛАТЬ ФУНКЦИИ ВИДИМЫМИ ДЛЯ HTML (если где-то остались onclick="...") ======
window.openModal    = openModal;
window.closeModal   = closeModal;
window.addTask      = addTask;
window.deleteTask   = deleteTask;
window.changeStatus = changeStatus;
window.filterTasks  = filterTasks;
window.testSound    = testSound;
