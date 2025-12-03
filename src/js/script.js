// ===== INITIAL STATE =====
let todos = [
    { id: 1, text: "Complete online JavaScript course", completed: true },
    { id: 2, text: "Jog around the park 3x", completed: false },
    { id: 3, text: "10 minutes meditation", completed: false },
    { id: 4, text: "Read for 1 hour", completed: false },
    { id: 5, text: "Pick up groceries", completed: false },
    { id: 6, text: "Complete Todo App on Frontend Mentor", completed: false }
];

let currentFilter = 'all';
let darkTheme = localStorage.getItem('darkTheme') === 'true';

// ===== DOM ELEMENTS =====
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const itemsCount = document.getElementById('items-count');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');
const body = document.body;

// ===== INITIALIZE APP =====
function init() {
    loadFromLocalStorage();
    updateTheme();
    renderTodos();
    updateItemsCount();
    setupEventListeners();
}

// ===== RENDER FUNCTIONS =====
function renderTodos() {
    todoList.innerHTML = '';
    
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'todo-item';
        emptyMessage.innerHTML = `
            <span class="todo-text" style="text-align: center; width: 100%; color: var(--dark-grayish-blue);">
                ${getEmptyMessage()}
            </span>
        `;
        todoList.appendChild(emptyMessage);
        return;
    }
    
    filteredTodos.forEach(todo => {
        const todoElement = createTodoElement(todo);
        todoList.appendChild(todoElement);
    });
}

function getFilteredTodos() {
    switch(currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

function getEmptyMessage() {
    switch(currentFilter) {
        case 'active':
            return 'No active todos';
        case 'completed':
            return 'No completed todos';
        default:
            return 'No todos yet';
    }
}

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = todo.id;
    li.draggable = true;
    
    li.innerHTML = `
        <div class="todo-checkbox ${todo.completed ? 'completed' : ''}" data-id="${todo.id}"></div>
        <span class="todo-text ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">${todo.text}</span>
        <button class="delete-btn" data-id="${todo.id}"></button>
    `;
    
    return li;
}

// ===== TODO OPERATIONS =====
function addTodo(text) {
    if (!text.trim()) return;
    
    const newTodo = {
        id: Date.now(),
        text: text.trim(),
        completed: false
    };
    
    todos.unshift(newTodo);
    renderTodos();
    updateItemsCount();
    saveToLocalStorage();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id == id);
    if (todo) {
        todo.completed = !todo.completed;
        renderTodos();
        updateItemsCount();
        saveToLocalStorage();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id != id);
    renderTodos();
    updateItemsCount();
    saveToLocalStorage();
}

function updateItemsCount() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    itemsCount.textContent = activeCount;
}

function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    renderTodos();
    updateItemsCount();
    saveToLocalStorage();
}

function setFilter(filter) {
    currentFilter = filter;
    
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    renderTodos();
}

// ===== THEME FUNCTIONS =====
function toggleTheme() {
    darkTheme = !darkTheme;
    updateTheme();
    localStorage.setItem('darkTheme', darkTheme);
}

function updateTheme() {
    if (darkTheme) {
        body.classList.add('dark-theme');
        themeIcon.src = './images/icon-sun.svg';
        themeIcon.alt = 'Switch to light mode';
    } else {
        body.classList.remove('dark-theme');
        themeIcon.src = './images/icon-moon.svg';
        themeIcon.alt = 'Switch to dark mode';
    }
}

// ===== DRAG & DROP (Bonus Feature) =====
let draggedItem = null;

function setupDragAndDrop() {
    todoList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('todo-item')) {
            draggedItem = e.target;
            setTimeout(() => {
                draggedItem.style.opacity = '0.5';
            }, 0);
        }
    });
    
    todoList.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    todoList.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedItem && e.target.classList.contains('todo-item')) {
            const draggedId = parseInt(draggedItem.dataset.id);
            const targetId = parseInt(e.target.dataset.id);
            
            if (draggedId !== targetId) {
                const draggedIndex = todos.findIndex(t => t.id === draggedId);
                const targetIndex = todos.findIndex(t => t.id === targetId);
                
                const [removed] = todos.splice(draggedIndex, 1);
                todos.splice(targetIndex, 0, removed);
                
                renderTodos();
                saveToLocalStorage();
            }
        }
    });
    
    todoList.addEventListener('dragend', () => {
        if (draggedItem) {
            draggedItem.style.opacity = '1';
            draggedItem = null;
        }
    });
}

// ===== LOCAL STORAGE =====
function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadFromLocalStorage() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        try {
            todos = JSON.parse(savedTodos);
        } catch (e) {
            console.error('Error loading todos:', e);
        }
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Add todo on Enter
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && todoInput.value.trim()) {
            addTodo(todoInput.value);
            todoInput.value = '';
        }
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Clear completed
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });
    
    // Todo list interactions
    todoList.addEventListener('click', (e) => {
        const target = e.target;
        const todoItem = target.closest('.todo-item');
        
        if (!todoItem) return;
        
        const id = parseInt(todoItem.dataset.id);
        
        // Checkbox click
        if (target.classList.contains('todo-checkbox') || 
            target.classList.contains('todo-text')) {
            toggleTodo(id);
        }
        
        // Delete button click
        if (target.classList.contains('delete-btn')) {
            deleteTodo(id);
        }
    });
    
    // Drag and drop
    setupDragAndDrop();
}

// ===== START APP =====
document.addEventListener('DOMContentLoaded', init);