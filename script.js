const input = document.getElementById("input");
const searchInput = document.getElementById("searchInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");
const counter = document.getElementById("counter");
const clearBtn = document.getElementById("clearBtn");

const allBtn = document.getElementById("allBtn");
const activeBtn = document.getElementById("activeBtn");
const doneBtn = document.getElementById("doneBtn");

const themeBtn = document.getElementById("themeBtn");
const priorityInput = document.getElementById("priorityInput");
const progress = document.getElementById("progress");
const deadlineInput = document.getElementById("deadlineInput");
const toast = document.getElementById("toast");
const priorityStats = document.getElementById("priorityStats");
const categoryInput = document.getElementById("categoryInput");
const langBtn = document.getElementById("langBtn");



let filter = "all";
let currentLanguage = localStorage.getItem("language") || "ru";
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const savedTheme = localStorage.getItem("theme");
const translations = {

  ru: {
    placeholder: "Новая задача",
    title: "ToDo List",
    add: "Добавить",
    search: "Поиск задач",
    clear: "Очистить выполненные",
    all: "Все",
    active: "Активные",
    done: "Выполненные"
  },

  en: {
    placeholder: "New problem",
    title: "ToDo List",
    add: "Add",
    search: "Search tasks",
    clear: "Clear completed",
    all: "All",
    active: "Active",
    done: "Completed"
  }

};


if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

render();








function applyTranslations() {

  const t = translations[currentLanguage];

  document.querySelector("h1").innerText = t.title;

  addBtn.innerText = t.add;

  searchInput.placeholder = t.search;

  clearBtn.innerText = t.clear;

  allBtn.innerText = t.all;

  activeBtn.innerText = t.active;

  doneBtn.innerText = t.done;
}

langBtn.onclick = function () {

  if (currentLanguage === "ru") {
    currentLanguage = "en";
  } else {
    currentLanguage = "ru";
  }

  applyTranslations();

  langBtn.innerText = currentLanguage === "ru"
  ? "🌍 EN"
  : "🌍 RU";

  localStorage.setItem("language", currentLanguage);
};

function updatePriorityStats() {
  const normalCount = tasks.filter((task) => task.priority === "normal").length;
  const importantCount = tasks.filter((task) => task.priority === "important").length;
  const urgentCount = tasks.filter((task) => task.priority === "urgent").length;

  priorityStats.innerText = `Обычных: ${normalCount} | Важных: ${importantCount} | Срочных: ${urgentCount}`;
}

function render() {
  list.innerHTML = "";

  let filteredTasks = getFilteredTasks();
  if (filteredTasks.length === 0) {
  if (searchInput.value.trim() !== "") {
    list.innerHTML = "<p>🔍 Ничего не найдено</p>";
  } else {
    list.innerHTML = "<p>📝 Нет задач</p>";
  }

  updateCounter();
  updateProgress();
  updatePriorityStats();
  return;
}

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");

    if (task.pinned) {
  li.classList.add("pinned");
}

    li.classList.add(task.priority || "normal");
    addDeadlineClass(li, task);

    if (task.done) {
      li.classList.add("done");
    }

    li.innerHTML = `
      <span onclick="toggleDone(${task.id})">
        ${task.pinned ? "⭐ " : ""}${task.text}
        ${task.category ? `<small>${getCategoryLabel(task.category)}</small>` : ""}
        ${task.deadline ? `<small>📅 ${task.deadline}</small>` : ""}
      </span>

      <div>
        <button class="pin-btn" onclick="togglePin(${task.id})">${task.pinned ? "⭐" : "☆"}</button>
        <button class="edit-btn" onclick="editTask(${task.id})">✏️</button>
        <button class="delete-btn" onclick="deleteTask(${task.id}, this)">❌</button>
      </div>
    `;

    list.appendChild(li);
  });

  updateCounter();
  updateProgress();
  updatePriorityStats();
}

function getFilteredTasks() {
  let filteredTasks = [...tasks];

  if (filter === "active") {
    filteredTasks = filteredTasks.filter((task) => !task.done);
  }

  if (filter === "done") {
    filteredTasks = filteredTasks.filter((task) => task.done);
  }

  const searchText = searchInput.value.toLowerCase();

  filteredTasks = filteredTasks.filter((task) =>
    task.text.toLowerCase().includes(searchText)
  );

  filteredTasks.sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return filteredTasks;
}

function addDeadlineClass(li, task) {
  if (!task.deadline) return;

  const today = new Date().toISOString().split("T")[0];

  if (task.deadline === today) {
    li.classList.add("today");
  }

  if (task.deadline < today) {
    li.classList.add("overdue");
  }
}

function updateCounter() {
  const doneCount = tasks.filter((task) => task.done).length;

  counter.innerText = `Выполнено: ${doneCount} / ${tasks.length}`;
}

function updateProgress() {
  const doneCount = tasks.filter((task) => task.done).length;
  let percent = 0;

  if (tasks.length > 0) {
    percent = (doneCount / tasks.length) * 100;
  }

  progress.style.width = percent + "%";
}

function addTask() {
  const text = input.value.trim();

  if (text === "") return;

  tasks.push({
    id: Date.now(),
    text: text,
    done: false,
    priority: priorityInput.value,
    pinned: false,
    deadline: deadlineInput.value,
    category: categoryInput.value
  });

  input.value = "";
  deadlineInput.value = "";
  input.focus();

  save();
  render();
  showToast("✅ Задача добавлена");
}

function deleteTask(id, button) {
  const li = button.closest("li");

  li.classList.add("removing");
  showToast("🗑 Задача удалена");

  setTimeout(() => {
    tasks = tasks.filter((task) => task.id !== id);
    save();
    render();
  }, 300);
}

function toggleDone(id) {
  const task = findTask(id);
  if (!task) return;

  task.done = !task.done;

  save();
  render();
  showToast(task.done ? "✅ Задача выполнена" : "↩️ Задача снова активна");
}

function togglePin(id) {
  const task = findTask(id);
  if (!task) return;

  task.pinned = !task.pinned;

  save();
  render();
  showToast(task.pinned ? "⭐ Задача закреплена" : "☆ Задача откреплена");
}

function editTask(id) {
  const task = findTask(id);
  if (!task) return;

  const newText = prompt("Изменить задачу:", task.text);

  if (newText === null || newText.trim() === "") return;

  task.text = newText.trim();

  save();
  render();
}

function findTask(id) {
  return tasks.find((task) => task.id === id);
}

function getCategoryLabel(category) {

  if (category === "study") return "📚 Учёба";

  if (category === "work") return "💼 Работа";

  if (category === "personal") return "🏠 Личное";

  if (category === "games") return "🎮 Игры";

  return category;
}

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function showToast(message) {
  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});


searchInput.addEventListener("input", render);

addBtn.onclick = addTask;


clearBtn.onclick = function () {
  tasks = tasks.filter((task) => !task.done);

  save();
  render();
  showToast("🧹 Выполненные задачи очищены");
};

allBtn.onclick = function () {
  filter = "all";
  render();
};

activeBtn.onclick = function () {
  filter = "active";
  render();
};

doneBtn.onclick = function () {
  filter = "done";
  render();
};

themeBtn.onclick = function () {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
};