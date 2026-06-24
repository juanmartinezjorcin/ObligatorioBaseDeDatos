# Mundial 2026 - Sistema de Ticketing

Sistema de venta, transferencia y validación de entradas con QR dinámico, desarrollado para el obligatorio de Bases de Datos II.

## Stack

- **Backend**: Node.js + Express + MySQL (mysql2)
- **Frontend**: React + Vite + TypeScript
- **Autenticación**: Firebase Auth (Admin SDK en backend, Client SDK en frontend)
- **Base de datos**: MySQL remota (servidor de la UCU)

---

## Requisitos previos

- Node.js (v18 o superior)
- npm
- Acceso a internet (para conectar con Firebase y con la base de datos remota de la UCU)
- El archivo `firebase-service-account.json` 
- El archivo `.env` del backend con las credenciales de conexión 

---

## Instalación

Desde la raíz del proyecto:

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

Colocar `firebase-service-account.json` y `.env` en la raíz de `Backend/` 

---

## Modo 1: Desarrollo normal (recomendado para probar todo excepto cámara QR)

Este modo alcanza para probar **todas las funcionalidades obligatorias** del sistema: login, registro, compra de entradas, transferencias, panel de administrador, y generación de QR. La única limitación es escanear el QR con la cámara de un celular real (ver Modo 2).

### Pasos

**Terminal 1 — Backend:**
```bash
cd Backend
npm run dev
```
Debería mostrar `API corriendo en puerto 3000`.

**Terminal 2 — Frontend:**
```bash
cd Frontend
npm run dev
```
Debería mostrar `Local: http://localhost:5173/`.

Abrir `http://localhost:5173` en el navegador. Listo, no hace falta ninguna configuración adicional. El frontend usa rutas relativas (`/api/...`) y Vite redirige automáticamente al backend en `localhost:3000` mediante un proxy configurado en `vite.config.ts`.

### Probar el escaneo de QR sin celular

Se puede probar la lógica completa de validación (sin la parte de "apuntar la cámara a otra pantalla") usando **dos pestañas del navegador en la misma compu**:
- Pestaña A: logueado como usuario general, en `/mis-entradas/:id/qr`, mostrando el QR
- Pestaña B: logueado como funcionario, en `/funcionario/escanear`

Chrome/Firefox permiten acceso a la cámara en `localhost` sin necesitar HTTPS. Apuntá la webcam a la pantalla donde se muestra el QR (o tomale una foto con el celular y mostrala en otra pantalla).

---

## Modo 2: Demo con celular real (para probar la cámara de verdad)

Safari en iOS (y WebKit en general) **bloquea el acceso a la cámara si el sitio no es HTTPS**, salvo en `localhost`. Como no pudimos usar la cámara de la misma computadora para fotografiar su propia pantalla, para probar el escaneo desde un celular real necesitamos exponer el frontend con una URL HTTPS pública. Usamos **ngrok** para esto.

### Requisitos adicionales

- Cuenta gratuita en [ngrok.com](https://ngrok.com)
- ngrok instalado: `brew install ngrok` (Mac) o ver [ngrok.com/download](https://ngrok.com/download)
- Configurar el authtoken una sola vez: `ngrok config add-authtoken TU_TOKEN`

### Pasos

**Terminal 1 — Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd Frontend
npm run dev
```

**Terminal 3 — Túnel ngrok:**
```bash
ngrok http 5173
```

Esto va a mostrar una URL pública con HTTPS, por ejemplo:
```
Forwarding   https://algo-random.ngrok-free.app -> http://localhost:5173
```

Desde el celular, abrir esa URL `https://algo-random.ngrok-free.app`.


### Flujo de prueba completo con dos dispositivos

1. En la PC: loguearse como usuario general, comprar/tener una entrada válida, ir a `/mis-entradas/:id/qr` para mostrar el QR en pantalla
2. En el celular (vía la URL de ngrok): loguearse como funcionario (`funcionario@test.com` / `123456`), ir a `/funcionario/escanear`
3. Apuntar la cámara del celular a la pantalla de la compu donde se muestra el QR
4. El QR expira a los 40 segundos, si tarda más, hay que regenerarlo

---

## Estructura del proyecto

```
Backend/
├── src/
│   ├── config/         # Conexión a MySQL y Firebase Admin
│   ├── middleware/      # Verificación de tokens Firebase
│   ├── routes/          # Definición de endpoints
│   └── controllers/     # Lógica de negocio
├── .env                 # Credenciales (no versionado)
├── firebase-service-account.json  # Credenciales Firebase (no versionado)
└── package.json

Frontend/
├── src/
│   ├── pages/            # Pantallas de la app
│   ├── components/       # Componentes reutilizables (rutas protegidas, etc)
│   ├── context/           # Estado global de autenticación
│   └── services/          # Cliente HTTP hacia el backend
├── firebase.ts            # Inicialización de Firebase (cliente)
├── vite.config.ts          # Config de Vite, incluye proxy hacia el backend
└── package.json
```

## Roles del sistema

| Rol | Acceso | Cómo se crea |
|---|---|---|
| `general` | Comprar entradas, transferir, ver perfil | Registro normal (`/register`) |
| `administrador` | Crear eventos, habilitar sectores | Endpoint `registro_admin` (manual, no expuesto en UI pública) |
| `funcionario` | Escanear y validar entradas en la puerta | Endpoint `registro_funcionario` (manual, requiere asignación de evento/sector y dispositivo) |