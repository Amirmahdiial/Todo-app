document.addEventListener("DOMContentLoaded", () => {
  const storedTasks = JSON.parse(localStorage.getItem("tasks"));
  if (storedTasks) {
    tasks = storedTasks;
    updateTaskList();
    updateStats();
  }
});

let tasks = [];
let editingIndex = null; 
let filter = 'all';

const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

const addTask = () => {
  const taskInput = document.getElementById("taskInput");
  const text = taskInput.value.trim();
  if (text) {
    tasks.push({ text: text, completed: false });
    taskInput.value = "";
    updateTaskList();
    updateStats();
    saveTasks();
  }
};

const toggleTaskComplete = (index) => {
  tasks[index].completed = !tasks[index].completed;
  updateTaskList();
  updateStats();
  saveTasks();
};

const confirmDelete = (index) => {
  const confirmation = document.createElement("div");
  confirmation.innerHTML = `
    <div id="confirmationDialog" style="width: 200px; height: 100px; display:flex; gap:10px; align-items: center; justify-content: center; position: fixed; top: 15%; left: 50%; transform: translate(-50%, -50%); background-color: var(--purple); border: 1px solid black; border-radius: 30px; padding: 20px; z-index: 10;">
      <p>Sure?</p>
      <button id="confirmYes" style="font-size: 20px; cursor: pointer;">yes</button>
    </div>
  `;
  document.body.appendChild(confirmation);

  document.getElementById("confirmYes").onclick = () => {
    tasks.splice(index, 1);
    updateTaskList();
    updateStats();
    saveTasks();
    document.body.removeChild(confirmation);
  };
  setTimeout(() => {
    if (document.body.contains(confirmation)) {
      document.body.removeChild(confirmation);
    }
  }, 3000);
};

const updateStats = () => {
  const completeTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks ? (completeTasks / totalTasks) * 100 : 0;
  const progressBar = document.getElementById("progress");
  progressBar.style.width = `${progress}%`;
  document.getElementById("numbers").innerText = `${completeTasks} / ${totalTasks}`;
};

const editTask = (index) => {
  if (editingIndex !== null) {
    const editedText = document.querySelector(`.txtarea[data-index='${editingIndex}']`).value.trim();
    if (editedText) {
      tasks[editingIndex].text = editedText; 
      document.querySelector(`img[data-index='${editingIndex}']`).src = './img/edit.png';
    }
    editingIndex = null; 
    updateTaskList(); 
    saveTasks(); 
    return; 
  }

  const taskTextArea = document.querySelector(`.txtarea[data-index='${index}']`);
  taskTextArea.disabled = false; 
  taskTextArea.focus();
  editingIndex = index; 

  document.querySelector(`img[data-index='${index}']`).src = './img/tik.png';

  document.querySelectorAll('.txtarea').forEach((textarea, idx) => {
    if (idx !== index) {
      textarea.disabled = true; 
    }
  });
};

const updateTaskList = () => {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  filteredTasks.forEach((task, index) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <div class="taskItem">
        <div class="task ${task.completed ? "completed" : ""}">
          <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""} data-index="${index}"/>
          <textarea class="txtarea" data-index="${index}" ${editingIndex === index ? '' : 'disabled'}>${task.text}</textarea>
        </div>
        <div class="icons">
          <img src="./img/edit.png" data-index="${index}" onclick="editTask(${index})" />
          <img src="./img/bin.png" onclick="confirmDelete(${tasks.indexOf(task)})" />
        </div>
      </div>
    `;
    listItem.querySelector(".checkbox").addEventListener("change", () => toggleTaskComplete(tasks.indexOf(task)));
    taskList.append(listItem);
  });
};

document.querySelectorAll("input[name='filter']").forEach((button) => {
  button.addEventListener("click", (e) => {
    filter = e.target.value;
    updateTaskList();
  });
});

document.getElementById("newTask").addEventListener("click", function (e) {
  e.preventDefault();
  addTask();
});
