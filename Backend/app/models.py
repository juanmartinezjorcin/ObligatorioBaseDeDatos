from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base


class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tipo_documento = Column(String(20))
    numero_documento = Column(String(30))
    pais_documento = Column(String(50))
    direccion_pais = Column(String(50))
    direccion_localidad = Column(String(100))
    direccion_calle = Column(String(100))
    direccion_numero = Column(String(10))
    direccion_codigo_postal = Column(String(15))

    telefonos = relationship("UsuarioTelefono", back_populates="usuario", cascade="all, delete-orphan")


class UsuarioTelefono(Base):
    __tablename__ = "usuario_telefono"

    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), primary_key=True)
    telefono = Column(String(20), primary_key=True)

    usuario = relationship("Usuario", back_populates="telefonos")


class AuthUser(Base):
    __tablename__ = "auth_user"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    firebase_uid = Column(String(200), unique=True, index=True, nullable=False)
    email = Column(String(200), nullable=True)
    id_usuario = Column(Integer, nullable=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), unique=True, index=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    role = Column(String(50), default="user")
    is_verified = Column(Boolean, default=False)
    registered_at = Column(DateTime(timezone=True), server_default=func.now())
