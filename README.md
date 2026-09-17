# Portal de Equipo con Tablero de Notas

Prueba técnica: aplicación web para que un equipo consulte su actividad, administre sus usuarios y organice notas en un tablero compartido tipo post-it.

> **Estado de la entrega**: proyecto completamente funcional en **ejecución local** mediante Docker Compose. **No se realizó despliegue en AWS**; la arquitectura de despliegue (SAM/CloudFormation) está preparada pero no fue ejecutada contra una cuenta real. No hay URL pública que visitar — toda la demostración se hace en local.

- **Tiempo empleado**: ~9 horas de trabajo efectivo.
- **Commit entregado**: `[completar con el hash del commit final antes de entregar]`

## Índice

- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Funcionalidades](#funcionalidades)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Cuentas de demostración](#cuentas-de-demostración)
- [Guía de uso y pruebas paso a paso](#guía-de-uso-y-pruebas-paso-a-paso)
- [Persistencia de datos](#persistencia-de-datos)
- [Despliegue en AWS (no ejecutado)](#despliegue-en-aws-no-ejecutado)
- [Limitaciones y pendientes conocidos](#limitaciones-y-pendientes-conocidos)

## Arquitectura

El sistema está compuesto por 3 servicios independientes, orquestados con Docker Compose:

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Frontend   │ ───▶ │   Backend    │ ◀─── │   Lambda    │
│ React + Vite│      │   Laravel    │      │  (Node.js)  │
│  (nginx)    │      │  + Sanctum   │      │             │
└─────────────┘      └──────────────┘      └─────────────┘
                             │
                          SQLite
                     (archivo persistente)
```

**Flujo del Dashboard de métricas** (requisito: el cálculo debe pasar por una función Lambda):

`Frontend → Lambda → Backend → Lambda → Frontend`

1. El componente `Dashboard.jsx` solicita `GET http://localhost:3001/metrics`.
2. La función Lambda (Node.js) consulta internamente al backend vía `GET http://backend:8000/api/notes` (ruta pública, accesible solo dentro de la red interna de Docker).
3. **La Lambda calcula las métricas**: filtra y cuenta las notas por estado (`Pendiente`, `En curso`, `Hecho`) y arma la respuesta con `total` + `distribution`. No es un simple proxy — el cómputo ocurre en la función.
4. El frontend recibe el JSON ya procesado y lo muestra en tarjetas.

> El backend también expone `GET /api/internal/metrics`, protegido con un token interno (`X-Internal-Token`), que hace el mismo cálculo del lado de Laravel. Actualmente no es el endpoint que consume la Lambda; queda disponible como alternativa ya construida.

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Axios, lucide-react |
| Backend | Laravel 11 (PHP 8.2), Sanctum (auth por tokens), SQLite |
| Función de métricas | Node.js 18 — Express en el contenedor local, handler compatible con AWS Lambda |
| Infraestructura (no desplegada) | Docker Compose (local) · AWS SAM / CloudFormation (Lambda + API Gateway, S3 + CloudFront, EC2) |

## Funcionalidades

- **Acceso**: inicio y cierre de sesión con token (Laravel Sanctum). Los usuarios inactivos no pueden iniciar sesión.
- **Roles**:
  - `admin`: tablero, dashboard y administración de usuarios.
  - `user`: tablero y dashboard.
- **Administración de usuarios** (solo `admin`): listar, crear, editar (nombre, correo, rol), activar/desactivar. Regla de negocio: no se puede desactivar ni cambiar de rol al último administrador activo del sistema.
- **Tablero compartido**: lienzo libre (sin columnas) con notas tipo post-it visibles y editables por todos los usuarios activos.
  - Cada nota tiene título, texto, estado (`Pendiente` / `En curso` / `Hecho`) y posición `x, y`.
  - El título, texto y estado se editan directamente sobre la nota; los cambios se guardan al perder el foco del campo (`onBlur`) o al cambiar el estado.
  - Las notas se mueven arrastrando con el mouse; al soltar, la nueva posición se guarda automáticamente.
  - Eliminación de notas.
- **Dashboard**: total de notas y distribución por estado, calculado por la Lambda.

## Estructura del proyecto

```
├── frontend/            # React + Vite + Tailwind
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
├── backend/             # Laravel 11 + Sanctum
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
├── lambda/               # Función de métricas (uso local en Docker)
│   ├── index.mjs         # Handler compatible con AWS Lambda
│   ├── server.js          # Wrapper HTTP para correr local
│   ├── package.json
│   └── Dockerfile
│
├── aws/                  # Variante orientada a despliegue en AWS
│   ├── server.js
│   └── template.yaml     # SAM
│
├── template.yaml          # SAM (raíz, referencia general)
└── docker-compose.yml
```

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose (incluido en Docker Desktop).
- Ningún otro requisito: no se necesita Node, PHP, Composer ni AWS CLI instalados en el host, todo corre dentro de los contenedores.
- No se necesita cuenta de AWS para ejecutar ni demostrar el proyecto.

## Instalación y ejecución

1. **Clonar el repositorio**

   ```bash
   git clone <url-del-repositorio>
   cd <carpeta-del-proyecto>
   ```

2. **Levantar todos los servicios**

   ```bash
   docker-compose up --build
   ```

   Esto construye y arranca 3 contenedores: `fixlat_backend`, `fixlat_frontend` y `fixlat_lambda`. La primera vez tarda unos minutos mientras se instalan dependencias (Composer, npm) dentro de las imágenes.

   En el primer arranque, el backend:
   - Crea el archivo de base de datos SQLite.
   - Ejecuta las migraciones.
   - Siembra las cuentas de demostración (ver sección siguiente).

   En arranques posteriores (`docker-compose up` sin volver a construir, o tras un `restart`), el backend **no vuelve a sembrar los datos** — solo aplica migraciones pendientes, por lo que las notas y usuarios que hayas creado se conservan.

3. **Confirmar que los 3 servicios están arriba**

   Deberías ver en la terminal logs de los tres contenedores. Puedes verificarlo también con:

   ```bash
   docker-compose ps
   ```

   Los tres deben mostrar estado `Up`.

4. **Abrir la aplicación**

   Ve a [http://localhost:3000](http://localhost:3000) en el navegador.

5. **Apagar el entorno**

   ```bash
   docker-compose down
   ```

   Esto detiene y elimina los contenedores, pero **no borra la base de datos** (el archivo SQLite vive en la carpeta `backend/` del host gracias al volumen montado). Al volver a hacer `docker-compose up`, tus datos siguen ahí.

   Si en algún momento quieres empezar desde cero (borrar todo y volver a sembrar los datos de demostración), elimina manualmente el archivo `backend/database/database.sqlite` antes de volver a levantar el entorno.

### Servicios y puertos

| Servicio | URL | Descripción |
|---|---|---|
| Frontend | http://localhost:3000 | Interfaz web (React) |
| Backend | http://localhost:8000 | API Laravel |
| Lambda (local) | http://localhost:3001/metrics | Función de métricas |

## Cuentas de demostración

Se crean automáticamente en el primer arranque del backend:

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@fixlat.com` | `admin123` |
| Usuario | `user@fixlat.com` | `user123` |

**Para crear e iniciar sesión con un usuario nuevo**: un administrador lo crea desde la pestaña **Usuarios** (nombre, correo, contraseña y rol). Ese usuario puede iniciar sesión de inmediato en la pantalla de login con el correo y la contraseña que el administrador le asignó — no requiere ningún paso de activación adicional, ya que los usuarios se crean activos por defecto.

## Guía de uso y pruebas paso a paso

Con el entorno ya levantado y la app abierta en `http://localhost:3000`:

1. **Iniciar sesión**
   - Ingresa con `admin@fixlat.com` / `admin123` (o usa el usuario de prueba `user@fixlat.com` / `user123` para ver la vista sin permisos de administración).
   - Si el usuario está inactivo, el login devuelve un error y no permite entrar (pruébalo desactivando un usuario, ver punto 4).

2. **Tablero de notas**
   - En la pestaña **Tablero**, escribe un título en el campo superior y presiona "+ Nueva Nota". Aparece un post-it en el lienzo.
   - Haz clic sobre el título o el texto de la nota para editarlos; al hacer clic fuera del campo (perder el foco), el cambio se guarda automáticamente.
   - Cambia el estado desde el selector inferior de la nota (`Pendiente` / `En curso` / `Hecho`).
   - Arrastra la nota a otra posición del lienzo y suéltala: la nueva posición se guarda sola.
   - Presiona "Eliminar" para borrar la nota.
   - **Prueba de persistencia**: recarga la página (F5) o reinicia el entorno (`docker-compose down` y luego `docker-compose up`) — las notas, su contenido, estado y posición deben seguir ahí.

3. **Dashboard**
   - En la pestaña **Dashboard**, verifica que el total de notas y la distribución por estado coincidan con lo que ves en el tablero.
   - Crea o cambia el estado de una nota en el tablero, vuelve a la pestaña Dashboard (o recárgala) y confirma que las cifras se actualizan.

4. **Administración de usuarios** (solo visible con `admin@fixlat.com`)
   - En la pestaña **Usuarios**, crea un nuevo usuario con rol `user` y luego cierra sesión e inicia sesión con esas credenciales para confirmar que funciona.
   - Vuelve a entrar como admin y prueba "Desactivar" sobre ese usuario nuevo; luego intenta iniciar sesión con esa cuenta — debe rechazar el acceso.
   - Intenta desactivar o cambiar el rol del **único administrador activo** (`admin@fixlat.com`, si es el único admin) — la aplicación debe impedirlo con un mensaje de error.
   - Inicia sesión con el usuario `user@fixlat.com` y confirma que la pestaña **Usuarios** no aparece (no tiene permisos de administración).

## Persistencia de datos

- La base de datos es un archivo **SQLite** (`backend/database/database.sqlite`).
- El `docker-compose.yml` monta la carpeta `./backend` completa como volumen dentro del contenedor (`./backend:/var/www`), por lo que el archivo SQLite vive físicamente en el host y sobrevive a `docker-compose down`, reinicios de contenedor, o reconstrucciones de la imagen.
- El `entrypoint.sh` del backend solo crea el archivo de base de datos y ejecuta el seeder de cuentas demo **la primera vez** (cuando el archivo SQLite no existe todavía). En arranques posteriores, únicamente aplica migraciones pendientes (`migrate --force`, sin `--fresh`), por lo que no se pierden notas ni usuarios creados.

## Despliegue en AWS (no ejecutado)

El repositorio incluye plantillas de **AWS SAM** (`template.yaml`) pensadas para una arquitectura de despliegue con:

- **Lambda + API Gateway** para el cálculo de métricas.
- **S3 + CloudFront** para servir el frontend estático.
- **EC2** ejecutando la API (Laravel) dentro de un contenedor Docker.

Esta arquitectura **no fue desplegada** contra una cuenta de AWS real como parte de esta entrega — no hay URL pública ni recursos activos en la nube. Las plantillas quedan como base de infraestructura como código, pero los comandos y pasos detallados de despliegue (`sam build`, `sam deploy`) y retirada (`sam delete`) de recursos no se documentan en detalle aquí, ya que no llegaron a ejecutarse ni validarse en esta entrega.

## Limitaciones y pendientes conocidos

- **No se realizó despliegue en AWS.** Todo lo descrito y demostrado corresponde a la ejecución local con Docker Compose.
- **Zoom y paneo del tablero**: por límite de tiempo, no se implementaron el zoom ni el desplazamiento (paneo) del lienzo del tablero, que estaban planeados originalmente. El arrastre y posicionamiento de notas dentro del área visible sí funciona completamente; lo que queda fuera es la navegación de un lienzo más grande que el viewport.
- El endpoint `GET /api/internal/metrics` (con token interno) está construido pero no es el que consume actualmente la Lambda; queda como alternativa no integrada.