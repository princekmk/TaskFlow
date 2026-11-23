import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Изучить основы React',
      category: 'Обучение',
      priority: 'Высокий',
      completed: false,
    },
    {
      id: 2,
      title: 'Создать структуру проекта',
      category: 'Разработка',
      priority: 'Средний',
      completed: true,
    },
    {
      id: 3,
      title: 'Подключить FastAPI',
      category: 'Разработка',
      priority: 'Высокий',
      completed: false,
    },
  ])

  const [newTask, setNewTask] = useState('')
  const [apiStatus, setApiStatus] = useState('Проверка...')
  const [filter, setFilter] = useState('Все')

  // Проверяем соединение с FastAPI
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/health')
      .then((response) => {
        if (!response.ok) throw new Error('API недоступен')
        return response.json()
      })
      .then(() => setApiStatus('Сервер работает'))
      .catch(() => setApiStatus('Нет соединения'))
  }, [])

  const addTask = (event) => {
    event.preventDefault()

    if (!newTask.trim()) return

    const task = {
      id: Date.now(),
      title: newTask.trim(),
      category: 'Личное',
      priority: 'Средний',
      completed: false,
    }

    setTasks((previous) => [task, ...previous])
    setNewTask('')
  }

  const toggleTask = (id) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    )
  }

  const deleteTask = (id) => {
    setTasks((previous) => previous.filter((task) => task.id !== id))
  }

  const completedCount = tasks.filter((task) => task.completed).length
  const activeCount = tasks.length - completedCount

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'Активные') return !task.completed
    if (filter === 'Выполненные') return task.completed
    return true
  })

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">T</div>
          <span>TaskFlow</span>
        </div>

        <div className="menu-label">МЕНЮ</div>

        <nav className="navigation">
          <a className="nav-item active" href="#dashboard">
            <span>▦</span> Обзор
          </a>
          <a className="nav-item" href="#tasks">
            <span>✓</span> Мои задачи
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">U</div>
            <div>
              <strong>Мой профиль</strong>
              <small>Пользователь</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <span className="date-label">РАБОЧЕЕ ПРОСТРАНСТВО</span>
            <h1>Обзор</h1>
          </div>

          <div className="server-status">
            <span className={apiStatus === 'Сервер работает' ? 'status-dot online' : 'status-dot'}></span>
            {apiStatus}
          </div>
        </header>

        <section className="welcome">
          <div>
            <span className="welcome-label">ТВОЙ ПРОГРЕСС</span>
            <h2>Всё под контролем.</h2>
            <p>Планируй задачи, следи за прогрессом и достигай целей.</p>
          </div>
          <div className="welcome-decoration">✦</div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span className="stat-icon purple">▦</span>
            <p>Всего задач</p>
            <strong>{tasks.length}</strong>
            <small>В твоём списке</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon orange">◷</span>
            <p>В процессе</p>
            <strong>{activeCount}</strong>
            <small>Осталось выполнить</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon green">✓</span>
            <p>Выполнено</p>
            <strong>{completedCount}</strong>
            <small>Отличная работа!</small>
          </div>
        </section>

        <section className="tasks-section" id="tasks">
          <div className="section-heading">
            <div>
              <span className="date-label">ТВОЙ СПИСОК</span>
              <h2>Мои задачи</h2>
            </div>
            <span className="task-counter">{tasks.length} задач</span>
          </div>

          <form className="add-task-form" onSubmit={addTask}>
            <input
              type="text"
              placeholder="Напиши новую задачу..."
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
            />
            <button type="submit">+ Добавить</button>
          </form>

          <div className="filters">
            {['Все', 'Активные', 'Выполненные'].map((item) => (
              <button
                key={item}
                className={filter === item ? 'filter active-filter' : 'filter'}
                onClick={() => setFilter(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">Задач пока нет.</div>
            ) : (
              filteredTasks.map((task) => (
                <div className="task-item" key={task.id}>
                  <button
                    className={task.completed ? 'task-check checked' : 'task-check'}
                    onClick={() => toggleTask(task.id)}
                    type="button"
                    aria-label="Изменить статус задачи"
                  >
                    {task.completed ? '✓' : ''}
                  </button>

                  <div className="task-info">
                    <strong className={task.completed ? 'task-done' : ''}>
                      {task.title}
                    </strong>
                    <small>{task.category}</small>
                  </div>

                  <span className={`priority ${task.priority === 'Высокий' ? 'high' : 'medium'}`}>
                    {task.priority}
                  </span>

                  <button
                    className="delete-task"
                    onClick={() => deleteTask(task.id)}
                    type="button"
                    aria-label="Удалить задачу"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <footer>
          TaskFlow <span>•</span> Твой личный менеджер задач
        </footer>
      </main>
    </div>
  )
}

export default App