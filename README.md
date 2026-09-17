# Portal de Equipo con Tablero de Notas

Aplicación de gestión de notas estilo Kanban (post-its arrastrables) con dashboard de métricas calculado por una función AWS Lambda y administración de usuarios con roles. Proyecto desarrollado como prueba técnica.

## Arquitectura

El sistema está compuesto por 4 piezas independientes, orquestadas con Docker Compose:

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Frontend   │ ───▶ │   Backend    │ ◀─── │   Lambda    │
│ React + Vite│      │   Laravel    │      │  (Node.js)  │
│  (nginx)    │      │  + Sanctum   │      │             │
└─────────────┘      └──────────────┘      └─────────────┘
      │                     │                     ▲
      │                  SQLite                   │
      └─────────────────────────────────────────────
         Dashboard consulta métricas directo a Lambda
```

**Flujo del Dashboard de métricas:**
`Frontend → Lambda → Backend → Lambda → Frontend`

1. El componente `Dashboard.jsx` solicita `GET http://localhost:3001/metrics`.
2. La Lambda consulta internamente al backend vía `GET http://backend:8000/api/notes` (ruta pública, accesible solo dentro de la red Docker).
3. **La Lambda calcula las métricas** (total de notas y distribución por estado: `Pendiente`, `En curso`, `Hecho`) — no es un simple proxy, el cómputo ocurre en la función.
4. El frontend recibe el JSON ya procesado y lo muestra en tarjetas.

> Nota: el backend también expone `GET /api/internal/metrics`, protegido con un token interno (`X-Internal-Token`), que devuelve el mismo cálculo ya resuelto del lado de Laravel. Actualmente no es el endpoint que usa la Lambda; queda disponible como alternativa.

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Axios, lucide-react |
| Backend | Laravel 11 (PHP 8.2), Sanctum (auth por tokens), SQLite |
| Función de métricas | Node.js 18, Express (contenedor local) / handler nativo (AWS Lambda) |
| Infraestructura | Docker Compose (local) — AWS SAM (Lambda + API Gateway, S3 + CloudFront, EC2) |

## Funcionalidades

- **Autenticación** por token (Laravel Sanctum).
- **Tablero Kanban**: notas tipo post-it, arrastrables libremente sobre un lienzo, con edición en línea de título/contenido y cambio de estado (`Pendiente` / `En curso` / `Hecho`).
- **Dashboard de métricas**: total de notas y distribución por estado, calculado por la Lambda.
- **Gestión de usuarios** (solo rol `admin`): crear, editar, activar/desactivar usuarios.
  - Regla de negocio: no se puede desactivar ni cambiar de rol al último administrador activo del sistema.

## Estructura del proyecto

```
├── frontend/           # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── BoardCanvas.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── UserManagement.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/            # Laravel 11 + Sanctum
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── NoteController.php
│   │   │   └── UserController.php
│   │   ├── Models/ (Note.php, User.php)
│   │   └── Providers/AppServiceProvider.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/DatabaseSeeder.php
│   ├── routes/api.php
│   ├── Dockerfile
│   └── entrypoint.sh
│
├── lambda/              # Función de métricas (uso local en Docker)
│   ├── index.mjs        # Handler compatible con AWS Lambda
│   ├── server.js         # Wrapper HTTP para correr local
│   ├── package.json
│   └── Dockerfile
│
├── aws/                 # Variante de despliegue en AWS
│   ├── server.js
│   └── template.yaml    # SAM
│
├── template.yaml         # SAM (raíz, despliegue local/general)
└── docker-compose.yml
```

## Requisitos previos

- Docker y Docker Compose

## Instalación y ejecución (local con Docker)

1. Clonar el repositorio.
2. Desde la raíz del proyecto, levantar todos los servicios:

   ```bash
   docker-compose up --build
   ```

3. El `entrypoint.sh` del backend crea automáticamente la base de datos SQLite, corre las migraciones y siembra los datos iniciales (`migrate:fresh --seed`) en cada arranque.

### Servicios disponibles

| Servicio | URL | Descripción |
|---|---|---|
| Frontend | http://localhost:3000 | Interfaz web (React) |
| Backend | http://localhost:8000 | API Laravel |
| Lambda | http://localhost:3001/metrics | Función de métricas |

### Usuarios de prueba (seed)

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | admin@fixlat.com | admin123 |
| Usuario | user@fixlat.com | user123 |

## Endpoints principales de la API

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/login` | — | Iniciar sesión |
| POST | `/api/logout` | Sanctum | Cerrar sesión |
| GET | `/api/me` | Sanctum | Usuario autenticado |
| GET | `/api/notes` | — (pública) | Listar notas |
| POST/PUT/DELETE | `/api/notes/{id}` | Sanctum | Crear / editar / eliminar notas |
| GET | `/api/internal/metrics` | Token interno | Métricas calculadas por el backend (alternativa no usada actualmente) |
| GET/POST/PUT/PATCH | `/api/users*` | Sanctum + rol admin | Gestión de usuarios |

## Despliegue en AWS

El proyecto incluye plantillas de **AWS SAM** (`template.yaml`) para desplegar la función de métricas como Lambda real (con API Gateway), el frontend en S3 + CloudFront, y el backend en una instancia EC2 con Docker. El detalle de este despliegue no forma parte del alcance documentado aquí.

## Notas y decisiones de diseño

- `GET /api/notes` se dejó como ruta pública intencionalmente para que la Lambda pueda consultarla sin necesidad de manejar credenciales de usuario, manteniendo desacoplada la función analítica de la autenticación de la API principal.
- Existen dos variantes de `server.js` y `template.yaml` (una en `lambda/`/raíz para uso local, otra en `aws/` orientada al despliegue) que reflejan la adaptación entre el entorno local con Docker y el entorno real en AWS.