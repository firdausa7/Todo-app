// API Configuration
const API_BASE = "https://x8ki-letl-twmt.n7.xano.io/api:O6_wlWlj/todo";

// App State
let todos = [];
let editingTodoId = null;
let currentFilter = {
    search: '',
    priority: ''
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    setupEventListeners();
    setupDarkMode();
    await loadTodos();
}

// Setup Event Listeners
function setupEventListeners() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleDarkMode);

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilter.search = e.target.value.toLowerCase();
            filterTodos();
        });
    }

    const priorityFilter = document.getElementById('priority-filter');
    if (priorityFilter) {
        priorityFilter.addEventListener('change', (e) => {
            currentFilter.priority = e.target.value;
            filterTodos();
        });
    }

    const addButton = document.getElementById('add-button');
    if (addButton) addButton.addEventListener('click', addTodo);

    const todoInput = document.getElementById('todo-input');
    if (todoInput) {
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTodo();
        });
    }

    const dueDateInput = document.getElementById('due-date');
    if (dueDateInput) {
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.min = today;
    }
}

// Dark Mode Setup
function setupDarkMode() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeIcon = document.getElementById('theme-icon');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        if (themeIcon) themeIcon.className = 'fas fa-sun text-lg';
    } else {
        document.body.classList.remove('dark');
        if (themeIcon) themeIcon.className = 'fas fa-moon text-lg';
    }
}

// Toggle Dark Mode
function toggleDarkMode() {
    const themeIcon = document.getElementById('theme-icon');
    const isDark = document.body.classList.toggle('dark');
    if (isDark) {
        if (themeIcon) themeIcon.className = 'fas fa-sun text-lg';
        localStorage.setItem('theme', 'dark');
    } else {
        if (themeIcon) themeIcon.className = 'fas fa-moon text-lg';
        localStorage.setItem('theme', 'light');
    }
}

// Load todos from API
async function loadTodos() {
    showLoading();
    try {
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        todos = Array.isArray(data) ? data : [];
        filterTodos();
        updateStats();
    } catch (error) {
        console.error(error);
        showError('Failed to load tasks. Please check your connection and API URL.');
    } finally {
        hideLoading();
    }
}

// Filter todos
function filterTodos() {
    const filtered = todos.filter(todo => {
        const matchesSearch = currentFilter.search === '' || (todo.title && todo.title.toLowerCase().includes(currentFilter.search));
        const matchesPriority = currentFilter.priority === '' || (todo.priority && todo.priority === currentFilter.priority);
        return matchesSearch && matchesPriority;
    });
    renderTodos(filtered);
}

// Render todos
function renderTodos(todosToRender) {
    const todoList = document.getElementById('todo-list');
    if (!todoList) return;

    if (todosToRender.length === 0) {
        showEmptyState();
        return;
    }

    todoList.innerHTML = '';
    todosToRender.forEach(todo => {
        const taskElement = createTaskElement(todo);
        todoList.appendChild(taskElement);
    });
}

// Create task element
function createTaskElement(todo) {
    const taskItem = document.createElement('li');
    taskItem.className = 'bg-white dark:bg-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-slate-600 animate-fadeIn';
    taskItem.dataset.id = todo.id;
    if (todo.completed) taskItem.classList.add('opacity-70');

    const dueDate = todo.due_date ? new Date(todo.due_date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }) : 'No due date';
    const createdDate = todo.created_at ? new Date(todo.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : 'Today';

    const priorityClass = todo.priority ? `priority-${todo.priority.toLowerCase()}` : 'priority-low';

    taskItem.innerHTML = `
        <div class="flex items-start justify-between">
            <div class="flex items-start space-x-4 flex-1">
                <input type="checkbox" class="task-checkbox mt-1 w-5 h-5 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500 transition-all duration-200" ${todo.completed ? 'checked' : ''}>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-3 mb-2">
                        <span class="task-title text-lg font-medium text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 ${todo.completed ? 'line-through text-slate-400' : ''}">
                            ${todo.title || 'Untitled Task'}
                        </span>
                        <span class="priority-badge px-3 py-1 rounded-full text-xs font-semibold ${priorityClass}">
                            ${todo.priority || 'Low'}
                        </span>
                    </div>
                    <div class="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                        <div class="due-date flex items-center space-x-1">
                            <i class="far fa-calendar"></i>
                            <span class="due-text">${dueDate}</span>
                        </div>
                        <div class="created-date">
                            Added: <span class="created-text">${createdDate}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-2 ml-4">
                <button class="edit-btn w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 flex items-center justify-center">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-600 hover:bg-red-100 dark:hover:bg-red-900 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 flex items-center justify-center">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;

    const checkbox = taskItem.querySelector('.task-checkbox');
    const title = taskItem.querySelector('.task-title');
    const editBtn = taskItem.querySelector('.edit-btn');
    const deleteBtn = taskItem.querySelector('.delete-btn');

    if (checkbox) checkbox.addEventListener('change', () => toggleComplete(todo));
    if (title) title.addEventListener('click', () => startEdit(todo, taskItem));
    if (editBtn) editBtn.addEventListener('click', () => startEdit(todo, taskItem));
    if (deleteBtn) deleteBtn.addEventListener('click', () => deleteTodo(todo.id, taskItem));

    return taskItem;
}

// Start edit
function startEdit(todo, taskItem) {
    if (editingTodoId === todo.id) return;
    editingTodoId = todo.id;

    const contentDiv = taskItem.querySelector('.min-w-0');
    const originalContent = contentDiv.innerHTML;

    contentDiv.innerHTML = `
        <input type="text" class="edit-input" value="${todo.title || ''}" placeholder="Task title...">
        <div class="edit-buttons">
            <button class="save-btn">Save</button>
            <button class="cancel-btn">Cancel</button>
        </div>
    `;

    const editInput = contentDiv.querySelector('.edit-input');
    const saveBtn = contentDiv.querySelector('.save-btn');
    const cancelBtn = contentDiv.querySelector('.cancel-btn');

    editInput.focus();
    editInput.select();

    const handleSave = async () => {
        const newTitle = editInput.value.trim();
        if (!newTitle) { alert('Task title cannot be empty'); return; }
        try { await updateTodo(todo.id, { title: newTitle }); } 
        catch (err) { console.error(err); }
    };

    const handleCancel = () => {
        editingTodoId = null;
        contentDiv.innerHTML = originalContent;
        const newTitle = contentDiv.querySelector('.task-title');
        if (newTitle) newTitle.addEventListener('click', () => startEdit(todo, taskItem));
    };

    saveBtn.addEventListener('click', handleSave);
    cancelBtn.addEventListener('click', handleCancel);
    editInput.addEventListener('keypress', async (e) => { if (e.key === 'Enter') await handleSave(); });
}

// Add Todo
async function addTodo() {
    const todoInput = document.getElementById('todo-input');
    const prioritySelect = document.getElementById('priority');
    const dueDateInput = document.getElementById('due-date');

    const title = todoInput.value.trim();
    const priority = prioritySelect.value;
    const dueDate = dueDateInput ? dueDateInput.value : null;

    if (!title) { todoInput.focus(); return; }

    try {
        const addButton = document.getElementById('add-button');
        const originalHTML = addButton.innerHTML;
        addButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        addButton.disabled = true;

        const response = await fetch(API_BASE, {
            method:'POST',
            headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
            body: JSON.stringify({ title, completed:false, priority, due_date: dueDate || null })
        });
        if (!response.ok) throw new Error(`Failed to create todo: ${response.status}`);

        await loadTodos();
        addButton.innerHTML = originalHTML;
        addButton.disabled = false;
        todoInput.value = '';
        if(dueDateInput) dueDateInput.value = '';
    } catch(err) {
        console.error(err);
        showError('Failed to add task.');
    }
}

// Toggle complete
async function toggleComplete(todo) {
    try {
        await fetch(`${API_BASE}/${todo.id}`, {
            method:'PUT',
            headers:{ 'Content-Type':'application/json','Accept':'application/json' },
            body: JSON.stringify({ completed: !todo.completed })
        });
        await loadTodos();
    } catch(err){ console.error(err); showError('Failed to update task.'); }
}

// Update todo
async function updateTodo(id, updates) {
    try {
        await fetch(`${API_BASE}/${id}`, {
            method:'PUT',
            headers:{ 'Content-Type':'application/json','Accept':'application/json' },
            body: JSON.stringify(updates)
        });
        editingTodoId = null;
        await loadTodos();
    } catch(err){ console.error(err); showError('Failed to update task.'); }
}

// Delete todo
async function deleteTodo(id, taskElement) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
        const response = await fetch(`${API_BASE}/${id}`, { method:'DELETE', headers:{'Accept':'application/json'} });
        if(!response.ok) throw new Error('Delete failed');
        await loadTodos();
    } catch(err){ console.error(err); showError('Failed to delete task.'); }
}

// Update Stats
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t=>t.completed).length;
    const pending = total - completed;
    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('pending-tasks').textContent = pending;
}

// Show / Hide Loading
function showLoading(){ const el=document.getElementById('loading-state'); if(el) el.classList.remove('hidden'); }
function hideLoading(){ const el=document.getElementById('loading-state'); if(el) el.classList.add('hidden'); }

// Empty / Error States
function showEmptyState(){
    const todoList = document.getElementById('todo-list');
    if(todoList) todoList.innerHTML = '<div class="text-center py-12">No tasks found</div>';
}

function showError(msg){
    const todoList = document.getElementById('todo-list');
    if(todoList) todoList.innerHTML = `<div class="text-center py-12 text-red-600">${msg}</div>`;
}
