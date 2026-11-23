const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

// Универсальная функция для запросов к Backend
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('taskflow_token')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(
      data.detail || `Ошибка сервера: ${response.status}`
    )

    error.status = response.status
    throw error
  }

  return data
}

// Регистрация пользователя
export function registerUser(userData) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

// Авторизация
export function loginUser(credentials) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

// Получение текущего пользователя
export function getCurrentUser() {
  return request('/api/auth/me')
}

// Получение списка задач
export function getTasks() {
  return request('/api/tasks/')
}

// Создание задачи
export function createTask(taskData) {
  return request('/api/tasks/', {
    method: 'POST',
    body: JSON.stringify(taskData),
  })
}

// Обновление задачи
export function updateTask(taskId, taskData) {
  return request(`/api/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  })
}

// Удаление задачи
export function deleteTask(taskId) {
  return request(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  })
}
