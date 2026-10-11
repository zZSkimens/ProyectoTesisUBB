# Sistema de Inducción y Panel de Tutores UBB

Proyecto de tesis para la Universidad del Bío-Bío (UBB), Campus Concepción. Integra un videojuego de inducción universitaria para estudiantes de primer año con un panel web que permite a los tutores pares acompañar y monitorear su avance.

## Tabla de contenidos

* [Descripción General](#descripción-general)
  * [Backend (API REST)](#backend-api-rest)
  * [Frontend (Panel de Tutor)](#frontend-panel-de-tutor)
  * [Cliente Videojuego](#cliente-videojuego)
* [Arquitectura del Proyecto](#arquitectura-del-proyecto)
  * [Estructura del Proyecto](#estructura-del-proyecto)
  * [Modelo de datos](#modelo-de-datos)
  * [API REST](#api-rest)
* [Instalación y Configuración](#instalación-y-configuración)
  * [Prerrequisitos](#prerrequisitos)
  * [Clonación del Repositorio](#clonación-del-repositorio)
  * [Configuración del Backend](#configuración-del-backend)
  * [Configuración del Frontend](#configuración-del-frontend)
  * [Comandos de desarrollo](#comandos-de-desarrollo)
  * [Despliegue](#despliegue)
* [Tecnologías](#tecnologías)
  * [Node.js y Express](#nodejs-y-express)
  * [React y Vite](#react-y-vite)
  * [PostgreSQL y Drizzle ORM](#postgresql-y-drizzle-orm)
  * [Godot Engine](#godot-engine)
  * [Librerías Clave](#librerías-clave)

---

## Descripción General

El sistema conecta una experiencia gamificada de inducción con herramientas de seguimiento para tutores pares y coordinadores. La información de estudiantes, progreso, observaciones y centros de atención se persiste en PostgreSQL.

### Backend (API REST)

El backend es una API REST desarrollada con Node.js, Express y TypeScript. Drizzle ORM administra el acceso a PostgreSQL.

- **Autenticación y autorización**: inicio de sesión con JWT, contraseñas almacenadas con `bcryptjs` y rutas protegidas para los roles `tutor` y `admin`.
- **Estudiantes**: inscripción de estudiantes novatos, validación del RUT y correo institucional, prevención de duplicados, búsqueda y filtros por estado de avance.
- **Seguimiento**: dashboard con métricas y alertas, resumen de misiones y ficha individual con progreso.
- **Bitácora de tutoría**: registro y consulta de observaciones, alertas y compromisos.
- **Centros de atención**: consulta y actualización independiente de hasta dos centros por tutor. Cada uno tiene su propio horario y modalidad; en modalidad presencial se elige edificio, piso y sala, y en modalidad online se selecciona Discord o Meet, con URL opcional.
- **Persistencia**: los datos se guardan en PostgreSQL y sobreviven al reinicio del backend. Las migraciones se encuentran en `database/migrations/`.
- **Estado del servicio**: `GET /api/status` comprueba el estado del backend y la conexión a la base de datos.

### Frontend (Panel de Tutor)

El frontend es una SPA desarrollada con React y Vite, ubicada en `tutor-panel/`.

- **Inicio de sesión**: valida credenciales contra el backend y conserva el token de sesión en `sessionStorage`.
- **Navegación**: sidebar con secciones de dashboard, nómina, actividades y centros de atención.
- **Dashboard**: métricas del grupo y alertas tempranas de estudiantes o actividades que requieren seguimiento.
- **Nómina y ficha**: búsqueda, filtros, inscripción, detalle del avance, observaciones y eliminación de estudiantes asignados al tutor.
- **Actividades**: seguimiento de las misiones de inducción y del avance de la cohorte.
- **Consultas**: configuración y vista previa de los centros de atención y sus horarios.
- **Diseño adaptable**: las vistas, fichas y formularios se ajustan a pantallas móviles y de escritorio.
- **Identidad visual**: utiliza logos y tipografías institucionales guardados en `tutor-panel/public/`.

### Cliente Videojuego

El cliente del videojuego de inducción está desarrollado en **Godot Engine 4** y se ubica en `client/`. Complementa el panel web con una experiencia gamificada para estudiantes de primer año.

---

## Arquitectura del Proyecto

### Estructura del Proyecto

```text
ProyectoTesisUBB/
├── backend/                       # API REST en Node.js, Express y TypeScript
│   ├── db/
│   │   ├── connection.ts          # Pool de PostgreSQL y configuración de Drizzle
│   │   ├── schema.ts              # Tablas, relaciones y tipos de Drizzle
│   │   └── seed.ts                # Datos de demostración para desarrollo
│   ├── src/
│   │   ├── config/                # Variables y configuración de la aplicación
│   │   ├── controllers/           # Controladores HTTP
│   │   ├── middlewares/           # Autenticación, roles y manejo de errores
│   │   ├── routes/                # Rutas de autenticación y tutoría
│   │   ├── services/              # Lógica de negocio y acceso a datos
│   │   ├── types/                 # Extensiones de tipos de Express
│   │   ├── utils/                 # Funciones auxiliares, incluida validación de RUT
│   │   ├── validations/           # Validación de entradas de API
│   │   └── index.ts               # Inicio de Express y servicio del panel compilado
│   ├── drizzle.config.ts          # Configuración de migraciones Drizzle
│   ├── package.json
│   └── tsconfig.json
├── tutor-panel/                   # SPA del tutor en React, TypeScript y Vite
│   ├── public/                    # Logos, favicon e identidad visual
│   ├── src/
│   │   ├── api/                   # Cliente Fetch para la API
│   │   ├── components/            # Sidebar, tabla, fichas y vistas del panel
│   │   ├── context/               # Estado de autenticación
│   │   ├── pages/                 # Login y dashboard
│   │   ├── types/                 # Tipos del frontend
│   │   ├── App.tsx                # Control de sesión y vistas
│   │   └── index.css              # Estilos y adaptación móvil
│   ├── index.html
│   ├── vite.config.js             # Vite y proxy local para /api
│   └── package.json
├── client/                        # Proyecto del videojuego en Godot
│   └── nuevo-proyecto-de-juego/
│       └── project.godot
├── database/
│   └── migrations/                # SQL, historial y snapshots de Drizzle
├── editor/                        # Archivos auxiliares del editor del videojuego
└── .github/workflows/deploy.yml   # Despliegue del backend en main
```

### Modelo de datos

Las tablas principales del esquema PostgreSQL son:

| Tabla | Propósito |
|---|---|
| `usuarios` | Cuentas de tutores y administradores. |
| `estudiantes` | Datos institucionales y tutor asignado. |
| `misiones` | Actividades de inducción disponibles. |
| `progreso_estudiantes` | Estado, puntaje, intentos y fecha de avance por misión. |
| `observaciones_tutoria` | Bitácora, alertas y compromisos asociados a estudiantes. |
| `centros_atencion` | Hasta dos ubicaciones o canales de consulta por tutor, cada uno con horario y modalidad propios. |

El esquema se administra mediante migraciones de Drizzle. El progreso y las observaciones de un estudiante están vinculados a su registro mediante claves foráneas con borrado en cascada.

### API REST

Todas las rutas están bajo el prefijo `/api`. Las rutas de tutoría requieren un token JWT en `Authorization: Bearer <token>` y el rol `tutor` o `admin`.

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Inicia sesión y entrega un token JWT. |
| `GET` | `/api/auth/perfil` | Obtiene el perfil de la sesión autenticada. |
| `GET` | `/api/status` | Comprueba el backend y la conexión PostgreSQL. |
| `GET` | `/api/tutores/dashboard` | Devuelve métricas y alertas del tutor. |
| `GET` | `/api/tutores/actividades` | Resume misiones y avance de la cohorte. |
| `GET` | `/api/tutores/estudiantes` | Lista estudiantes; admite `busqueda` y `estado` (`riesgo`, `progreso`, `al_dia`). |
| `POST` | `/api/tutores/estudiantes` | Inscribe un estudiante asignado al tutor autenticado. |
| `GET` | `/api/tutores/estudiantes/:id` | Obtiene la ficha y el avance del estudiante asignado. |
| `DELETE` | `/api/tutores/estudiantes/:id` | Elimina un estudiante asignado y sus registros asociados. |
| `GET` | `/api/tutores/estudiantes/:id/observaciones` | Consulta la bitácora del estudiante. |
| `POST` | `/api/tutores/estudiantes/:id/observaciones` | Registra una observación o compromiso. |
| `GET` | `/api/tutores/centros-atencion` | Consulta los centros configurados del tutor. |
| `PUT` | `/api/tutores/centros-atencion` | Crea o actualiza uno o dos centros de atención. |

---

## Instalación y Configuración

### Prerrequisitos

- [Node.js](https://nodejs.org/) **20.19 o superior de la línea 20, o 22.12 o superior**. Vite 8 requiere estas versiones.
- npm, incluido con Node.js.
- [Git](https://git-scm.com/).
- Una base de datos PostgreSQL 14 o superior y credenciales con permisos para ejecutar las migraciones.
- [Godot Engine 4](https://godotengine.org/), opcional para editar o ejecutar el videojuego.

No es obligatorio instalar `psql` para iniciar la aplicación: el backend se conecta a PostgreSQL mediante el paquete `pg`, y Drizzle ejecuta las migraciones desde Node.js.

### Clonación del Repositorio

```bash
git clone https://github.com/zZSkimens/ProyectoTesisUBB.git
cd ProyectoTesisUBB
```

### Configuración del Backend

1. Entra en el backend e instala las dependencias:

```bash
cd backend
npm install
```

2. Crea `backend/.env` con la configuración del servidor, PostgreSQL y seguridad:

```env
# Servidor
HOST=localhost
PORT=3000

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
PASSWORD=tu_contraseña
DATABASE=tesis

# Seguridad y JWT
ACCESS_TOKEN_SECRET=tu_clave_secreta_jwt
cookieKey=tu_clave_de_cookie
```

3. Aplica las migraciones para crear o actualizar el esquema:

```bash
npm run db:migrate
```

4. Opcionalmente, en una base de datos de desarrollo, carga los registros de demostración:

```bash
npm run db:seed
```

El seed crea un tutor, estudiantes, misiones y algunos registros de progreso de ejemplo.

5. Inicia el backend en modo desarrollo:

```bash
npm run dev
```

El backend queda disponible en `http://localhost:3000`. Puedes comprobar el estado de la conexión a la base de datos en `http://localhost:3000/api/status`.

### Configuración del Frontend

Abre otra terminal desde la raíz del repositorio:

```bash
cd tutor-panel
npm install
npm run dev
```

Vite muestra la dirección local; por defecto es `http://localhost:5173`. En desarrollo, las peticiones que comienzan con `/api` se redirigen al backend en `http://localhost:3000`, según `tutor-panel/vite.config.js`.

El panel autentica tutores y administradores con cuentas registradas en `usuarios`.

### Comandos de desarrollo

Desde `backend/`:

| Comando | Uso |
|---|---|
| `npm run dev` | Inicia Express con recarga de desarrollo. |
| `npm run build` | Compila TypeScript en `backend/dist/`. |
| `npm start` | Inicia la versión compilada. |
| `npm run db:generate` | Genera una migración a partir de cambios al esquema Drizzle. |
| `npm run db:migrate` | Aplica las migraciones pendientes. |
| `npm run db:push` | Sincroniza directamente el esquema; reservar para desarrollo. |
| `npm run db:studio` | Abre Drizzle Studio para inspeccionar datos. |
| `npm run db:seed` | Inserta datos de demostración. |

Desde `tutor-panel/`:

| Comando | Uso |
|---|---|
| `npm run dev` | Inicia Vite para desarrollo. |
| `npm run build` | Revisa TypeScript y compila los archivos del panel en `dist/`. |
| `npm run preview` | Sirve localmente la compilación de Vite para previsualizarla. |
| `npm run lint` | Ejecuta Oxlint. |

### Despliegue

Para desplegar el sistema en el servidor:

1. Configura un runner Linux **self-hosted** para el repositorio y mantenlo en línea. El servidor debe contar con Node.js/npm y PM2, y tener acceso a PostgreSQL.
2. Guarda la configuración de producción del backend en `~/backend.env`.
3. Integra los cambios en `main`. El workflow `.github/workflows/deploy.yml` se ejecuta con cada `push` a esa rama: compila el panel y el backend, aplica las migraciones y reinicia el proceso `backend-tesis` con PM2.
4. Confirma que la ejecución en GitHub Actions finalice correctamente y comprueba el servicio en `/api/status`.

El backend sirve el panel compilado desde `tutor-panel/dist`.

---

## Tecnologías

### Node.js y Express

- **Uso**: servidor HTTP y API REST, middlewares, autenticación y acceso a la lógica de negocio.
- **Enlace**: [Express.js](https://expressjs.com/)

### React y Vite

- **Uso**: SPA del panel del tutor, compilación de recursos y servidor local con proxy a `/api`.
- **Enlaces**: [React](https://react.dev/) · [Vite](https://vite.dev/)

### PostgreSQL y Drizzle ORM

- **Uso**: persistencia relacional de usuarios, estudiantes, misiones, progreso, observaciones y centros de atención.
- **Enlaces**: [PostgreSQL](https://www.postgresql.org/) · [Drizzle ORM](https://orm.drizzle.team/)

### Godot Engine

- **Uso**: desarrollo del videojuego 2D de inducción universitaria.
- **Enlace**: [Godot Engine](https://godotengine.org/)

### Librerías Clave

- **bcryptjs**: hash y verificación de contraseñas.
- **jsonwebtoken**: generación y validación de tokens de sesión.
- **pg**: conexión del backend con PostgreSQL.
- **drizzle-orm / drizzle-kit**: acceso tipado a datos y administración de migraciones.
- **lucide-react**: iconos de la interfaz.
- **dotenv**: carga de variables de entorno.
