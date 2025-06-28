document.addEventListener('DOMContentLoaded', async () => {
    // 📌 1. Load user from localStorage
    const user = JSON.parse(localStorage.getItem('taskflow-user'));
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
  
    const name = user.name;
    document.getElementById('username').textContent = name;
    document.getElementById('avatar').src = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(name)}`;
  
    // 📌 2. Sign Out
    document.getElementById('signout').addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'index.html';
    });
  
    // 📌 3. Load tasks from localStorage or DummyJSON API
    let tasks = JSON.parse(localStorage.getItem('taskflow-tasks'));
    if (!tasks) {
      const response = await fetch('https://dummyjson.com/todos');
      const data = await response.json();
      tasks = data.todos.slice(0, 5).map(todo => ({
        id: Date.now() + Math.random(),
        title: todo.todo,
        stage: 'todo',
        modified: getCurrentTime()
      }));
      localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
    }
  
    // 📌 4. Render tasks initially
    let searchQuery = '';
    renderTasks();

    // 📌 6. Task Search/Filtering
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderTasks();
      });
    }
  
    // 📌 5. Add Task Handler
    document.getElementById('add-task').addEventListener('click', () => {
      const input = document.getElementById('task-input');
      const text = input.value.trim();
      if (!text) return;

      // Get category and priority
      const categoryInput = document.getElementById('category-input');
      const priorityInput = document.getElementById('priority-input');
      const category = categoryInput ? categoryInput.value : 'General';
      const priority = priorityInput ? priorityInput.value : 'Medium';

      const newTask = {
        id: Date.now(),
        title: text,
        category,
        priority,
        stage: 'todo',
        modified: getCurrentTime()
      };

  
      tasks.push(newTask);
      updateStorage();
      renderTasks();
      input.value = '';
    });
  
    // 📌 Helper: Render All Tasks
    function renderTasks() {
      ['todo', 'completed', 'archived'].forEach(stage => {
        const list = document.getElementById(`${stage}-list`);
        list.innerHTML = '';
        let filtered = tasks.filter(task => task.stage === stage);
        // Apply search filter if searchQuery is not empty
        if (searchQuery && searchQuery.trim() !== '') {
          filtered = filtered.filter(task => task.title.toLowerCase().includes(searchQuery));
        }
        document.getElementById(`${stage}-count`).textContent = filtered.length;
  
        filtered.forEach(task => {
          const card = document.createElement('div');
          card.className = 'task-card';
  
          card.innerHTML = `
            <p>${task.title}</p>
            <div class="meta-row">
              <span class="category">${task.category || 'General'}</span>
              <span class="priority priority-${(task.priority || 'Medium').toLowerCase()}">${task.priority || 'Medium'}</span>
            </div>
            <small>Last modified: ${task.modified}</small>
            <div class="actions">${getActions(task)}</div>
          `;
  
          // Add smooth removal for future delete/archive features
          card.setAttribute('data-task-id', task.id);
  
          list.appendChild(card);
        });
      });
    }
  
    // 📌 Helper: Action Buttons Based on Stage
    function getActions(task) {
      const { id, stage } = task;
      const buttons = {
        todo: `
          <button onclick="changeStage(${id}, 'completed')">Complete</button>
          <button onclick="changeStage(${id}, 'archived')">Archive</button>
          <button class='delete-btn' onclick="deleteTask(${id})">Delete</button>`,
        completed: `
          <button onclick="changeStage(${id}, 'todo')">Move to Todo</button>
          <button onclick="changeStage(${id}, 'archived')">Archive</button>
          <button class='delete-btn' onclick="deleteTask(${id})">Delete</button>`,
        archived: `
          <button onclick="changeStage(${id}, 'todo')">Move to Todo</button>
          <button onclick="changeStage(${id}, 'completed')">Move to Completed</button>
          <button class='delete-btn' onclick="deleteTask(${id})">Delete</button>`
      };
      return buttons[stage];
    }
  
    // 📌 Helper: Change Task Stage
    window.changeStage = function (taskId, newStage) {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex].stage = newStage;
        tasks[taskIndex].modified = getCurrentTime();
        updateStorage();
        renderTasks();
      }
    };

    // 📌 Helper: Delete Task
    window.deleteTask = function (taskId) {
      const card = document.querySelector(`.task-card[data-task-id='${taskId}']`);
      if (card) {
        card.classList.add('removing');
        setTimeout(() => {
          tasks = tasks.filter(t => t.id !== taskId);
          updateStorage();
          renderTasks();
        }, 350);
      } else {
        tasks = tasks.filter(t => t.id !== taskId);
        updateStorage();
        renderTasks();
      }
    };

  
    // 📌 Helper: Update LocalStorage
    function updateStorage() {
      localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
    }
  
    // 📌 Helper: Get Current Time in Format
    function getCurrentTime() {
      const now = new Date();
      return now.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }
  });
  