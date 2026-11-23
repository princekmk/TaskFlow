
def test_home(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "running"


def test_health(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_register(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 201
    assert response.json()["username"] == "testuser"
    assert "hashed_password" not in response.json()


def test_duplicate_registration(client):
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123",
    }

    client.post("/api/auth/register", json=user_data)
    response = client.post("/api/auth/register", json=user_data)

    assert response.status_code == 409


def test_login(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword",
        },
    )

    assert response.status_code == 401


def create_user_and_get_token(client, username, email):
    client.post(
        "/api/auth/register",
        json={
            "username": username,
            "email": email,
            "password": "password123",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "password123",
        },
    )

    return response.json()["access_token"]


def test_create_task(client):
    token = create_user_and_get_token(
        client, "user1", "user1@example.com"
    )

    response = client.post(
        "/api/tasks/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Изучить FastAPI",
            "description": "Пройти тестирование API",
            "priority": "high",
        },
    )

    assert response.status_code == 201
    assert response.json()["title"] == "Изучить FastAPI"
    assert response.json()["priority"] == "high"


def test_get_tasks(client):
    token = create_user_and_get_token(
        client, "user1", "user1@example.com"
    )

    client.post(
        "/api/tasks/",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Первая задача"},
    )

    response = client.get(
        "/api/tasks/",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_update_task(client):
    token = create_user_and_get_token(
        client, "user1", "user1@example.com"
    )
    headers = {"Authorization": f"Bearer {token}"}

    task = client.post(
        "/api/tasks/",
        headers=headers,
        json={"title": "Старая задача"},
    ).json()

    response = client.put(
        f"/api/tasks/{task['id']}",
        headers=headers,
        json={"title": "Новая задача", "status": "done"},
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Новая задача"
    assert response.json()["status"] == "done"


def test_delete_task(client):
    token = create_user_and_get_token(
        client, "user1", "user1@example.com"
    )
    headers = {"Authorization": f"Bearer {token}"}

    task = client.post(
        "/api/tasks/",
        headers=headers,
        json={"title": "Удалить меня"},
    ).json()

    response = client.delete(
        f"/api/tasks/{task['id']}",
        headers=headers,
    )

    assert response.status_code == 204

    response = client.get(
        f"/api/tasks/{task['id']}",
        headers=headers,
    )

    assert response.status_code == 404


def test_user_cannot_access_another_users_task(client):
    token1 = create_user_and_get_token(
        client, "user1", "user1@example.com"
    )
    token2 = create_user_and_get_token(
        client, "user2", "user2@example.com"
    )

    task = client.post(
        "/api/tasks/",
        headers={"Authorization": f"Bearer {token1}"},
        json={"title": "Личная задача"},
    ).json()

    response = client.get(
        f"/api/tasks/{task['id']}",
        headers={"Authorization": f"Bearer {token2}"},
    )

    assert response.status_code == 404


def test_register_with_short_password(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "123",
        },
    )

    assert response.status_code == 422


def test_register_with_invalid_email(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "invalid-email",
            "password": "password123",
        },
    )

    assert response.status_code == 422


def test_tasks_require_authentication(client):
    response = client.get("/api/tasks/")

    assert response.status_code in (401, 403)


def test_create_task_with_empty_title(client):
    token = create_user_and_get_token(
        client, "user1", "user1@example.com"
    )

    response = client.post(
        "/api/tasks/",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": ""},
    )

    assert response.status_code == 422
