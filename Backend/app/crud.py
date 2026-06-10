from sqlalchemy.orm import Session
from . import models, schemas, auth


def get_auth_user_by_firebase_uid(db: Session, firebase_uid: str):
    return db.query(models.AuthUser).filter(models.AuthUser.firebase_uid == firebase_uid).first()


def create_auth_user(db: Session, firebase_uid: str, email: str | None = None, id_usuario: int | None = None):
    au = models.AuthUser(firebase_uid=firebase_uid, email=email, id_usuario=id_usuario)
    db.add(au)
    db.commit()
    db.refresh(au)
    return au


def ensure_local_usuario(db: Session, email: str | None = None) -> models.Usuario:
    # This function will create a minimal usuario record if none exists.
    # Preferably, users should complete profile later.
    # We try to find by email mapping in auth_user; if none, create an empty usuario.
    u = db.query(models.Usuario).first()
    if u:
        return u
    newu = models.Usuario(
        tipo_documento=None,
        numero_documento=None,
        pais_documento=None,
        direccion_pais=None,
        direccion_localidad=None,
        direccion_calle=None,
        direccion_numero=None,
        direccion_codigo_postal=None,
    )
    db.add(newu)
    db.commit()
    db.refresh(newu)
    return newu


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user_in: schemas.UserCreate):
    hashed = auth.get_password_hash(user_in.password)
    user = models.User(
        email=user_in.email,
        password_hash=hashed,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
