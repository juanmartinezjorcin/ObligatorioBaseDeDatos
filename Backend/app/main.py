from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from . import models, schemas, crud, database, firebase_auth

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Obligatorio - Ticketing API")


@app.post("/api/auth/firebase_login")
def firebase_login(payload: dict, db: Session = Depends(database.get_db)):
    """Recibe JSON {"id_token": "..."}, verifica con Firebase y mapea/crea auth_user."""
    id_token = payload.get("id_token")
    if not id_token:
        raise HTTPException(status_code=400, detail="id_token required")
    decoded = firebase_auth.verify_id_token(id_token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid Firebase ID token")

    firebase_uid = decoded.get("uid")
    email = decoded.get("email")

    au = crud.get_auth_user_by_firebase_uid(db, firebase_uid)
    if au:
        return {"status": "ok", "firebase_uid": firebase_uid, "email": au.email, "id_usuario": au.id_usuario}

    # create mapping; optionally create a minimal usuario row
    local_usuario = crud.ensure_local_usuario(db, email=email)
    newau = crud.create_auth_user(db, firebase_uid=firebase_uid, email=email, id_usuario=local_usuario.id_usuario)
    return {"status": "created", "firebase_uid": firebase_uid, "email": email, "id_usuario": newau.id_usuario}


def get_current_user(authorization: str | None = Header(None), db: Session = Depends(database.get_db)):
    """Dependency que valida el bearer token de Firebase y retorna el usuario local mapeado."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    id_token = authorization.split(" ", 1)[1]
    decoded = firebase_auth.verify_id_token(id_token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")
    firebase_uid = decoded.get("uid")
    au = crud.get_auth_user_by_firebase_uid(db, firebase_uid)
    if not au:
        local_usuario = crud.ensure_local_usuario(db, email=decoded.get("email"))
        au = crud.create_auth_user(db, firebase_uid=firebase_uid, email=decoded.get("email"), id_usuario=local_usuario.id_usuario)
    return {"firebase_uid": au.firebase_uid, "email": au.email, "id_usuario": au.id_usuario}


@app.get("/api/me")
def me(current=Depends(get_current_user)):
    return current
