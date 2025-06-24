import React, { createContext, useContext, useState, useReducer } from 'react';
import { Plus, Check, X, Folder, CheckCircle2, Circle, Trash2 } from 'lucide-react';

// Context para gerenciar tarefas e categorias
const TaskContext = createContext();

// Reducer para gerenciar o estado das tarefas e categorias
const taskReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, { id: Date.now(), name: action.payload, tasks: [] }]
      };
    
    case 'ADD_TASK':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.categoryId
            ? {
                ...category,
                tasks: [...category.tasks, {
                  id: Date.now(),
                  text: action.payload.text,
                  completed: false
                }]
              }
            : category
        )
      };
    
    case 'TOGGLE_TASK':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.categoryId
            ? {
                ...category,
                tasks: category.tasks.map(task =>
                  task.id === action.payload.taskId
                    ? { ...task, completed: !task.completed }
                    : task
                )
              }
            : category
        )
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.categoryId
            ? {
                ...category,
                tasks: category.tasks.filter(task => task.id !== action.payload.taskId)
              }
            : category
        )
      };
    
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload)
      };
    
    default:
      return state;
  }
};

// Provider do Context
const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, {
    categories: [
      {
        id: 1,
        name: 'Trabalho',
        tasks: [
          { id: 1, text: 'Revisar relatório mensal', completed: false },
          { id: 2, text: 'Preparar apresentação', completed: true }
        ]
      },
      {
        id: 2,
        name: 'Estudos',
        tasks: [
          { id: 3, text: 'Estudar React Context', completed: true },
          { id: 4, text: 'Fazer exercícios de JavaScript', completed: false }
        ]
      }
    ]
  });

  const addCategory = (name) => {
    dispatch({ type: 'ADD_CATEGORY', payload: name });
  };

  const addTask = (categoryId, text) => {
    dispatch({ type: 'ADD_TASK', payload: { categoryId, text } });
  };

  const toggleTask = (categoryId, taskId) => {
    dispatch({ type: 'TOGGLE_TASK', payload: { categoryId, taskId } });
  };

  const deleteTask = (categoryId, taskId) => {
    dispatch({ type: 'DELETE_TASK', payload: { categoryId, taskId } });
  };

  const deleteCategory = (categoryId) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
  };

  return (
    <TaskContext.Provider value={{
      categories: state.categories,
      addCategory,
      addTask,
      toggleTask,
      deleteTask,
      deleteCategory
    }}>
      {children}
    </TaskContext.Provider>
  );
};

// Hook personalizado para usar o contexto
const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext deve ser usado dentro do TaskProvider');
  }
  return context;
};

// Componente para adicionar categoria
const AddCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { addCategory } = useTaskContext();

  const handleSubmit = () => {
    if (categoryName.trim()) {
      addCategory(categoryName.trim());
      setCategoryName('');
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="add-category-button"
      >
        <Plus size={20} />
        Nova Categoria
      </button>
    );
  }

  return (
    <div className="category-form">
      <div className="form-row">
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nome da categoria..."
          className="form-input"
          autoFocus
        />
        <button
          onClick={handleSubmit}
          className="btn-primary"
        >
          <Check size={16} />
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="btn-secondary"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Componente para adicionar tarefa
const AddTask = ({ categoryId }) => {
  const [taskText, setTaskText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { addTask } = useTaskContext();

  const handleSubmit = () => {
    if (taskText.trim()) {
      addTask(categoryId, taskText.trim());
      setTaskText('');
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="add-task-button"
      >
        <Plus size={16} />
        Nova Tarefa
      </button>
    );
  }

  return (
    <div className="task-form">
      <div className="task-form-row">
        <input
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Adicionar nova tarefa..."
          className="task-input"
          autoFocus
        />
        <button
          onClick={handleSubmit}
          className="btn-success"
        >
          <Check size={14} />
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="btn-cancel"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

// Componente para exibir uma tarefa
const TaskItem = ({ task, categoryId }) => {
  const { toggleTask, deleteTask } = useTaskContext();

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <button
        onClick={() => toggleTask(categoryId, task.id)}
        className={`task-checkbox ${task.completed ? 'completed' : ''}`}
      >
        {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </button>
      
      <span className={`task-text ${task.completed ? 'completed' : ''}`}>
        {task.text}
      </span>
      
      <button
        onClick={() => deleteTask(categoryId, task.id)}
        className="delete-task-btn"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

// Componente para lista de tarefas
const TaskList = ({ category }) => {
  const completedTasks = category.tasks.filter(task => task.completed).length;
  const totalTasks = category.tasks.length;

  return (
    <div className="tasks-list">
      {category.tasks.map(task => (
        <TaskItem key={task.id} task={task} categoryId={category.id} />
      ))}
      
      {totalTasks > 0 && (
        <div className="progress-counter">
          {completedTasks} de {totalTasks} tarefas concluídas
        </div>
      )}
    </div>
  );
};

// Componente para exibir uma categoria
const CategoryCard = ({ category }) => {
  const { deleteCategory } = useTaskContext();
  
  return (
    <div className="category-card">
      <div className="category-header">
        <div className="category-title">
          <Folder size={20} />
          <h3>{category.name}</h3>
        </div>
        <button
          onClick={() => deleteCategory(category.id)}
          className="delete-category-btn"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="category-content">
        <TaskList category={category} />
        <AddTask categoryId={category.id} />
      </div>
    </div>
  );
};

// Componente para lista de categorias
const CategoryList = () => {
  const { categories } = useTaskContext();

  if (categories.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Folder size={48} />
        </div>
        <p className="empty-state-title">Nenhuma categoria criada ainda</p>
        <p className="empty-state-subtitle">Comece criando sua primeira categoria!</p>
      </div>
    );
  }

  return (
    <div className="categories-grid">
      {categories.map(category => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
};

// Componente principal
const App = () => {
  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background: linear-gradient(135deg, #e0f2fe 0%, #f3e5f5 100%);
      min-height: 100vh;
    }

    .app-container {
      min-height: 100vh;
      padding: 1rem;
      background: linear-gradient(135deg, #e0f2fe 0%, #f3e5f5 100%);
    }

    .main-content {
      max-width: 90rem;
      margin: 0 auto;
    }

    .app-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .app-title {
      font-size: 2.5rem;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .app-subtitle {
      color: #6b7280;
      font-size: 1.1rem;
    }

    .add-category-button {
      width: 100%;
      padding: 1rem;
      border: 2px dashed #93c5fd;
      border-radius: 0.5rem;
      background: transparent;
      color: #2563eb;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }

    .add-category-button:hover {
      border-color: #60a5fa;
      background-color: #eff6ff;
    }

    .category-form {
      background: white;
      padding: 1rem;
      border-radius: 0.5rem;
      border: 2px solid #bfdbfe;
      margin-bottom: 2rem;
    }

    .form-row {
      display: flex;
      gap: 0.5rem;
    }

    .form-input {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 1rem;
      outline: none;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      box-shadow: 0 0 0 2px #3b82f6;
      border-color: #3b82f6;
    }

    .btn-primary {
      padding: 0.5rem 1rem;
      background-color: #2563eb;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary:hover {
      background-color: #1d4ed8;
    }

    .btn-secondary {
      padding: 0.5rem 1rem;
      background-color: #9ca3af;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-secondary:hover {
      background-color: #6b7280;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    @media (min-width: 768px) {
      .categories-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .categories-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .category-card {
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      animation: fadeIn 0.3s ease-out;
    }

    .category-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
    }

    .category-header {
      background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
      color: white;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .category-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .delete-category-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: color 0.2s ease;
    }

    .delete-category-btn:hover {
      color: #fca5a5;
    }

    .category-content {
      padding: 1rem;
    }

    .tasks-list {
      margin-bottom: 1rem;
    }

    .task-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 0.375rem;
      margin-bottom: 0.5rem;
      transition: background-color 0.2s ease;
      animation: fadeIn 0.2s ease-out;
    }

    .task-item:hover {
      background-color: #f9fafb;
    }

    .task-item.completed {
      background-color: #f0fdf4;
    }

    .task-checkbox {
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      transition: color 0.2s ease;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .task-checkbox:hover,
    .task-checkbox.completed {
      color: #16a34a;
    }

    .task-text {
      flex: 1;
      color: #1f2937;
      transition: all 0.2s ease;
    }

    .task-text.completed {
      text-decoration: line-through;
      color: #6b7280;
    }

    .delete-task-btn {
      background: none;
      border: none;
      color: #ef4444;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .delete-task-btn:hover {
      color: #dc2626;
    }

    .add-task-button {
      width: 100%;
      padding: 0.5rem;
      border: 1px dashed #d1d5db;
      border-radius: 0.375rem;
      background: transparent;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .add-task-button:hover {
      border-color: #9ca3af;
      background-color: #f9fafb;
    }

    .task-form {
      padding: 0.5rem;
      background-color: #f9fafb;
      border-radius: 0.375rem;
      margin-top: 0.5rem;
    }

    .task-form-row {
      display: flex;
      gap: 0.5rem;
    }

    .task-input {
      flex: 1;
      padding: 0.25rem 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.2s ease;
    }

    .task-input:focus {
      box-shadow: 0 0 0 2px #3b82f6;
      border-color: #3b82f6;
    }

    .btn-success {
      padding: 0.25rem 0.5rem;
      background-color: #16a34a;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-success:hover {
      background-color: #15803d;
    }

    .btn-cancel {
      padding: 0.25rem 0.5rem;
      background-color: #9ca3af;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-cancel:hover {
      background-color: #6b7280;
    }

    .progress-counter {
      font-size: 0.75rem;
      color: #6b7280;
      text-align: center;
      padding-top: 0.5rem;
      border-top: 1px solid #e5e7eb;
      margin-top: 0.5rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 0;
      color: #6b7280;
    }

    .empty-state-icon {
      margin: 0 auto 1rem;
      color: #d1d5db;
    }

    .empty-state-title {
      font-size: 1.125rem;
      margin-bottom: 0.5rem;
    }

    .empty-state-subtitle {
      font-size: 0.875rem;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .app-title {
        font-size: 2rem;
      }
      
      .categories-grid {
        grid-template-columns: 1fr;
      }
      
      .form-row,
      .task-form-row {
        flex-direction: column;
      }
      
      .form-row button,
      .task-form-row button {
        width: 100%;
      }
    }

    button:focus,
    input:focus {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
  `;

  return (
    <TaskProvider>
      <style>{styles}</style>
      <div className="app-container">
        <div className="main-content">
          <header className="app-header">
            <h1 className="app-title">
              Gerenciador de Tarefas
            </h1>
            <p className="app-subtitle">
              Organize suas atividades por categoria de forma simples e eficiente
            </p>
          </header>

          <AddCategory />
          <CategoryList />
        </div>
      </div>
    </TaskProvider>
  );
};

export default App;