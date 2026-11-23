@'
# TaskFlow

Full-stack веб-приложение для управления личными задачами.

## Features

- User registration and authentication.
- JWT-based authorization.
- Create, view, update and delete tasks.
- Task status and priority management.
- Task deadlines.
- User data isolation.
- Responsive React interface.

## Tech Stack

**Backend:** Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, Pydantic, JWT.

**Frontend:** React 19, Vite, JavaScript, ESLint.

**Tools:** Docker Compose, Git, GitHub, Pytest.

## Project Structure

```text
TaskFlow/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── security.py
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── .env.example
├── docker-compose.yml
└── README.md