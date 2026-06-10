# Backend API (FastAPI)

Rápido scaffold para autenticación con FastAPI, SQLAlchemy y JWT.

Requisitos:

- Python 3.10+

Instalación:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Ejecutar server de desarrollo:

```bash
uvicorn app.main:app --reload --port 8000
```

Por defecto usa SQLite local (`./test.db`). Para usar MySQL exportar `DATABASE_URL` con el driver `pymysql`:

```bash
export DATABASE_URL="mysql+pymysql://<usuario>:<contraseña>@mysql.reto-ucu.net:50006/IC_GrupoX"
```

Autenticación de usuarios (contraseñas):
- Las contraseñas y el flujo de autenticación se gestionan en Firebase Authentication (no se almacenan contraseñas en este backend).
- Configure una cuenta de servicio y exporte la variable `GOOGLE_APPLICATION_CREDENTIALS` apuntando al JSON de la cuenta de servicio:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
```

Endpoints relacionados:
- `POST /api/auth/firebase_login` -> Body `{ "id_token": "..." }`. Verifica el ID token y retorna/crea el mapeo `auth_user`.
- `GET /api/me` -> Ejemplo de ruta protegida. Enviar encabezado `Authorization: Bearer <ID_TOKEN>`.

Endpoints iniciales:
- `POST /api/auth/register` -> Registrar usuario
- `POST /api/auth/login` -> Login (JWT)
