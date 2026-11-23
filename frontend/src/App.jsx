import { useEffect, useState } from 'react'
import {
  loginUser,
  registerUser,
  getCurrentUser,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from './api'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [user, setUser] = useState(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [apiStatus, setApiStatus] = useState('Проверка...')
  const [error, setError] = useState('')

  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: '',
  })

  const [filter, setFilter] = useState('Все')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
  })

  // Загрузка профиля и задач при открытии приложения
  useEffect(() => {
    async function initializeApp() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

        const healthResponse = await fetch(`${API_URL}/api/health`)

        if (!healthResponse.ok) {
          throw new Error('Сервер недоступен')
        }

        setApiStatus('Сервер работает')

        const token = localStorage.getItem('taskflow_token')

        if (token) {
          const currentUser = await getCurrentUser()
          const userTasks = await getTasks()

          setUser(currentUser)
          setTasks(userTasks)
        }
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      localStorage.removeItem('taskflow_token')
      setUser(null)
      setTasks([])
    }
    setApiStatus('Сервер недоступен')
    setError(err.message || 'Не удалось подключиться к серверу')
    } finally {
       setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  // Вход или регистрация
  const handleAuth = async (event) => {
    event.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      if (authMode === 'register') {
        await registerUser({
          username: authForm.username,
          email: authForm.email,
          password: authForm.password,
        })
      }

      const result = await loginUser({
        email: authForm.email,
        password: authForm.password,
      })

      localStorage.setItem('taskflow_token', result.access_token)

      const currentUser = await getCurrentUser()
      const userTasks = await getTasks()

      setUser(currentUser)
      setTasks(userTasks)
      setAuthForm({
        username: '',
        email: '',
        password: '',
      })
    } catch (err) {
      setError(err.message || 'Не удалось выполнить вход')
    } finally {
      setIsSaving(false)
    }
  }

  // Выход из аккаунта
  const handleLogout = () => {
    localStorage.removeItem('taskflow_token')
    setUser(null)
    setTasks([])
    setError('')
  }

  // Создание задачи через API
  const addTask = async (event) => {
    event.preventDefault()

    if (!form.title.trim()) return

    setIsSaving(true)
    setError('')

    try {
      const newTask = await createTask({
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: 'todo',
        priority: form.priority,
        deadline: null,
      })

      setTasks((previous) => [newTask, ...previous])

      setForm({
        title: '',
        description: '',
        priority: 'medium',
      })

      setIsModalOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Изменение статуса задачи
  const toggleTask = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'

    setError('')

    try {
      const updatedTask = await updateTask(task.id, {
        status: newStatus,
      })

      setTasks((previous) =>
        previous.map((item) =>
          item.id === task.id ? updatedTask : item
        )
      )
    } catch (err) {
      setError(err.message)
    }
  }

  // Удаление задачи через API
  const removeTask = async (id) => {
    setError('')

    try {
      await deleteTask(id)

      setTasks((previous) =>
        previous.filter((task) => task.id !== id)
      )
    } catch (err) {
      setError(err.message)
    }
  }

  const completedCount = tasks.filter(
    (task) => task.status === 'done'
  ).length

  const activeCount = tasks.length - completedCount

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'Активные') return task.status !== 'done'
    if (filter === 'Выполненные') return task.status === 'done'
    return true
  })

  const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
  }

  // Экран загрузки
  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>TaskFlow</h2>
          <p>Загрузка приложения...</p>
        </div>
      </div>
    )
  }

  // Экран входа и регистрации
  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-icon">T</div>
            <span>TaskFlow</span>
          </div>

          <h1>
            {authMode === 'login'
              ? 'С возвращением!'
              : 'Создать аккаунт'}
          </h1>

          <p className="auth-description">
            {authMode === 'login'
              ? 'Войди, чтобы продолжить работу с задачами.'
              : 'Зарегистрируйся и начни планировать свои задачи.'}
          </p>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <form className="auth-form" onSubmit={handleAuth}>
            {authMode === 'register' && (
              <>
                <label htmlFor="username">Имя пользователя</label>
                <input
                  id="username"
                  type="text"
                  minLength={3}
                  maxLength={50}
                  placeholder="Например, Alex"
                  value={authForm.username}
                  onChange={(event) =>
                    setAuthForm({
                      ...authForm,
                      username: event.target.value,
                    })
                  }
                  required
                />
              </>
            )}

            <label htmlFor="email">Электронная почта</label>
            <input
              id="email"
              type="email"
              placeholder="example@mail.com"
              value={authForm.email}
              onChange={(event) =>
                setAuthForm({
                  ...authForm,
                  email: event.target.value,
                })
              }
              required
            />

            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              minLength={8}
              placeholder="Не менее 8 символов"
              value={authForm.password}
              onChange={(event) =>
                setAuthForm({
                  ...authForm,
                  password: event.target.value,
                })
              }
              required
            />

            <button
              className="auth-submit"
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? 'Подождите...'
                : authMode === 'login'
                  ? 'Войти'
                  : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="auth-switch">
            {authMode === 'login'
              ? 'Ещё нет аккаунта?'
              : 'Уже есть аккаунт?'}

            <button
              type="button"
              onClick={() => {
                setAuthMode(
                  authMode === 'login' ? 'register' : 'login'
                )
                setError('')
              }}
            >
              {authMode === 'login'
                ? 'Регистрация'
                : 'Войти'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Основной интерфейс
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
            <div className="avatar">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div>
              <strong>{user.username}</strong>
              <small>{user.email}</small>
              <button
                className="logout-button"
                onClick={handleLogout}
                type="button"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <span className="date-label">
              РАБОЧЕЕ ПРОСТРАНСТВО
            </span>
            <h1>Обзор</h1>
          </div>

          <div className="server-status">
            <span className="status-dot online" />
            {apiStatus}
          </div>
        </header>

        {error && (
          <div className="error-message app-error">
            {error}
            <button onClick={() => setError('')} type="button">
              ×
            </button>
          </div>
        )}

        <section className="welcome">
          <div>
            <span className="welcome-label">
              ТВОЙ ПРОГРЕСС
            </span>
            <h2>Всё под контролем.</h2>
            <p>
              Планируй задачи, следи за прогрессом и достигай целей.
            </p>
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

            <span className="task-counter">
              {tasks.length} задач
            </span>
          </div>

          <div className="task-actions">
            <div className="filters">
              {['Все', 'Активные', 'Выполненные'].map((item) => (
                <button
                  key={item}
                  className={
                    filter === item
                      ? 'filter active-filter'
                      : 'filter'
                  }
                  onClick={() => setFilter(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              className="add-task-button"
              onClick={() => setIsModalOpen(true)}
              type="button"
            >
              + Добавить
            </button>
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                Задач пока нет.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div className="task-item" key={task.id}>
                  <button
                    className={
                      task.status === 'done'
                        ? 'task-check checked'
                        : 'task-check'
                    }
                    onClick={() => toggleTask(task)}
                    type="button"
                    aria-label="Изменить статус задачи"
                  >
                    {task.status === 'done' ? '✓' : ''}
                  </button>

                  <div className="task-info">
                    <strong
                      className={
                        task.status === 'done' ? 'task-done' : ''
                      }
                    >
                      {task.title}
                    </strong>

                    <small>
                      {task.description || 'Без описания'}
                    </small>
                  </div>

                  <span
                    className={`priority ${
                      task.priority === 'high'
                        ? 'high'
                        : task.priority === 'medium'
                          ? 'medium'
                          : 'low'
                    }`}
                  >
                    {priorityLabels[task.priority]}
                  </span>

                  <button
                    className="delete-task"
                    onClick={() => removeTask(task.id)}
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

      {isModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsModalOpen(false)
            }
          }}
        >
          <div
            className="task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-header">
              <div>
                <span className="date-label">НОВАЯ ЗАДАЧА</span>
                <h2 id="modal-title">Добавить задачу</h2>
              </div>

              <button
                className="modal-close"
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Закрыть окно"
              >
                ×
              </button>
            </div>

            <form onSubmit={addTask}>
              <label htmlFor="task-title">Название задачи</label>
              <input
                id="task-title"
                type="text"
                placeholder="Например, изучить React"
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value,
                  })
                }
                required
                maxLength={200}
              />

              <label htmlFor="task-description">Описание</label>
              <input
                id="task-description"
                type="text"
                placeholder="Дополнительная информация"
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
              />

              <label htmlFor="task-priority">Приоритет</label>
              <select
                id="task-priority"
                value={form.priority}
                onChange={(event) =>
                  setForm({
                    ...form,
                    priority: event.target.value,
                  })
                }
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>

              <div className="modal-actions">
                <button
                  className="modal-cancel"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Отмена
                </button>

                <button
                  className="modal-submit"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? 'Сохранение...' : 'Создать задачу'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App