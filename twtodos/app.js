const STORAGE_KEY = "twdodos.tasks";
let tasks = loadTasks();
let currentFilter = "all";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyCopy = document.querySelector("#empty-copy");

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

function visibleTasks() {
  if (currentFilter === "active") return tasks.filter(task => !task.completed);
  if (currentFilter === "completed") return tasks.filter(task => task.completed);
  return tasks;
}

function render() {
  const visible = visibleTasks();
  taskList.replaceChildren();
  visible.forEach((task, index) => {
    const row = document.createElement("div");
    row.className = `task-row${task.completed ? " completed" : ""}`;
    row.style.animationDelay = `${index * 35}ms`;

    const check = document.createElement("button");
    check.className = "task-check";
    check.type = "button";
    check.setAttribute("aria-label", task.completed ? `Mark ${task.text} as open` : `Complete ${task.text}`);
    check.addEventListener("click", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const remove = document.createElement("button");
    remove.className = "delete-task";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Delete ${task.text}`);
    remove.addEventListener("click", () => deleteTask(task.id));

    row.append(check, text, remove);
    taskList.append(row);
  });

  const hasVisibleTasks = visible.length > 0;
  taskList.classList.toggle("d-none", !hasVisibleTasks);
  emptyState.classList.toggle("d-none", hasVisibleTasks);
  if (currentFilter === "completed") {
    emptyTitle.textContent = "No completed tasks";
    emptyCopy.textContent = "Finish something from your open list and it will appear here.";
  } else if (currentFilter === "active") {
    emptyTitle.textContent = "You’re all clear";
    emptyCopy.textContent = "Every task is complete. Enjoy the breathing room.";
  } else {
    emptyTitle.textContent = "Nothing here yet";
    emptyCopy.textContent = "Add a task above and give your day a starting point.";
  }

  const completed = tasks.filter(task => task.completed).length;
  document.querySelector("#total-count").textContent = tasks.length;
  document.querySelector("#active-count").textContent = tasks.length - completed;
  document.querySelector("#completed-count").textContent = completed;
  document.querySelector("#progress-count").textContent = tasks.length ? `${Math.round(completed / tasks.length * 100)}%` : "0%";
  document.querySelector("#clear-completed").disabled = completed === 0;
}

function addTask(text) {
  tasks.unshift({ id: crypto.randomUUID(), text: text.trim(), completed: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  render();
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!taskInput.value.trim()) return;
  addTask(taskInput.value);
  taskInput.value = "";
  taskInput.focus();
});

document.querySelectorAll(".filter-tab").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter-tab").forEach(tab => tab.classList.toggle("active", tab === button));
    render();
  });
});

document.querySelector("#clear-completed").addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
});

render();
