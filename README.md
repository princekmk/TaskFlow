# TaskFlow

**TaskFlow** — веб-приложение для управления задачами. Позволяет создавать задачи, устанавливать приоритеты и сроки выполнения, отслеживать статус и управлять личным списком дел.

## Возможности

- Регистрация и авторизация пользователей.
- Создание, просмотр, редактирование и удаление задач.
- Установка приоритетов и сроков выполнения.
- Изменение статуса задач.
- Разделение задач между пользователями.
- Защита API с помощью JWT-токенов.

## Технологический стек

**Backend:**
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- JWT

**Frontend:**
- React
- Vite
- JavaScript
- CSS

**Инфраструктура:**
- Docker Compose
- Git и GitHub

## Структура проекта

```text
TaskFlow/
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   │   └── 9cfa46701689_create_users_and_tasks_tables.py
│   │   ├── env.py
│   │   ├── README
│   │   └── script.py.mako
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   └── tasks.py
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── security.py
│   ├── tests/
│   │   ├── conftest.py
│   │   └── test_api.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── .env.example
├── .gitignore
├── alembic.ini
├── docker-compose.yml
└── README.md
```

## Запуск проекта

### 1. Клонирование репозитория

```bash
git clone https://github.com/princekmk/TaskFlow.git
cd TaskFlow
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта на основе `.env.example` и укажите необходимые параметры подключения к базе данных и секретный ключ.

### 3. Запуск Backend

```bash
python -m venv .venv
```

Активация виртуального окружения:

```powershell
.\.venv\Scripts\Activate.ps1
```

Установка зависимостей:

```bash
pip install -r backend/requirements.txt
```

Запуск сервера:

```bash
python -m uvicorn backend.app.main:app --reload
```

Документация API будет доступна по адресу:

`http://127.0.0.1:8000/docs`

### 4. Запуск Frontend

В новом терминале:

```bash
cd frontend
npm install
npm run dev
```

### 5. Запуск через Docker

При настроенном Docker Desktop можно запустить проект командой:

```bash
docker compose up --build
```

## Тестирование

Backend-тесты:

```bash
python -m pytest backend/tests -v
```

Проверка Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Автор

**TaskFlow** — учебный full-stack проект, демонстрирующий разработку клиент-серверного приложения для управления задачами.