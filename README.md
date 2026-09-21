# Sistema de Inducción y Panel de Tutores UBB

Proyecto de tesis para la Universidad del Bío-Bío (UBB) enfocado en el acompañamiento y monitoreo de estudiantes de primer año mediante un videojuego de inducción universitaria y un panel web de gestión y seguimiento para tutores.

## Tabla de contenidos
* [Descripción General](#descripción-general)
  * [Backend (API REST)](#backend-api-rest)
  * [Frontend (Panel de Tutor)](#frontend-panel-de-tutor)
  * [Cliente Videojuego](#cliente-videojuego)
* [Arquitectura del Proyecto](#arquitectura-del-proyecto)
  * [Estructura del Proyecto](#estructura-del-proyecto)
* [Instalación y Configuración](#instalación-y-configuración)
  * [Prerrequisitos](#prerrequisitos)
  * [Clonación del Repositorio](#clonación-del-repositorio)
  * [Configuración del Backend](#configuración-del-backend)
  * [Configuración del Frontend](#configuración-del-frontend)
* [Tecnologías](#tecnologías)
  * [Node.js y Express](#nodejs-y-express)
  * [React y Vite](#react-y-vite)
  * [PostgreSQL y Drizzle ORM](#postgresql-y-drizzle-orm)
  * [Godot Engine](#godot-engine)
  * [Librerías Clave](#librerías-clave)

---

## Descripción General

El sistema permite integrar la experiencia de inducción estudiantil gamificada con un panel de control académico para tutores pares y docentes de la Universidad del Bío-Bío.

### Backend (API REST)

El Backend proporciona los servicios y la lógica de negocio central del sistema:

- **Autenticación y Seguridad**: Inicio de sesión mediante JSON Web Tokens (JWT) y cifrado seguro de contraseñas con `bcryptjs`.
- **Gestión de Tutores y Métricas**: Endpoints para calcular en tiempo real métricas clave (total de alumnos asignados, estudiantes al día, en progreso y en riesgo).
- **Nómina y Ficha de Estudiantes**: Consulta de estudiantes asignados por tutor y detalle individual de avance en misiones y desafíos de inducción.
- **Persistencia de Base de Datos**: Integración con PostgreSQL gestionada a través de Drizzle ORM y scripts de inicialización de datos de prueba (`seed.js`).

### Frontend (Panel de Tutor)

El Frontend (`tutor-panel`) ofrece una interfaz de usuario moderna basada en la identidad gráfica oficial de la UBB:

- **Autenticación Institucional**: Pantalla de acceso (`LoginPage`) con validación de credenciales.
- **Dashboard y Métricas**: Tarjetas visuales de estado y semáforo de riesgo estudiantil.
- **Nómina de Estudiantes**: Tabla con búsqueda dinámica por nombre o RUT, filtros por estado (Al día, En progreso, En riesgo) y barra de progreso de avance.
- **Ficha del Estudiante**: Modal detallado con datos institucionales en orden vertical y lista de misiones completadas/pendientes.
- **Perfil de Tutor**: Menú de opciones de cuenta, edición de datos personales y carga de foto de perfil (PNG, JPG, JPEG, WEBP).
- **Identidad Gráfica Oficial**: Tipografía institucional `Tipo-UBB-Condensed` y logos oficiales de la Dirección General de Comunicación Estratégica (DGCE).

### Cliente Videojuego

- Videojuego de inducción estudiantil desarrollado en **Godot Engine 4**, que permite a los novatos explorar campus universitarios, completar misiones de bienvenida y registrar su progreso.

---

## Arquitectura del Proyecto

### Estructura del Proyecto

```bash
ProyectoTesisUBB
├── backend/                   # Servidor API REST en Node.js y Express
│   ├── db/                    # Conexión, esquemas Drizzle y datos de prueba (seed)
│   │   ├── connection.js
│   │   ├── schema.js
│   │   └── seed.js
│   ├── src/
│   │   ├── config/            # Variables de entorno y configuración
│   │   ├── controllers/       # Controladores de peticiones HTTP
│   │   ├── middlewares/       # Middleware de autenticación y manejo de errores
│   │   ├── routes/            # Definición de rutas y endpoints
│   │   ├── services/          # Lógica de negocio y consultas a la base de datos
│   │   ├── validations/       # Esquemas de validación de datos
│   │   └── index.js           # Punto de entrada del servidor
│   ├── .env                   # Variables de entorno
│   ├── drizzle.config.js      # Configuración de Drizzle ORM
│   └── package.json
│
├── tutor-panel/               # Panel web para tutores en React + Vite
│   ├── public/                # Logos institucionales, fuentes y favicon
│   │   ├── fonts/             # Tipografía oficial Tipo-UBB
│   │   ├── favicon.png        # Isotipo escudo oficial
│   │   ├── logo-ubb-dashboard.png
│   │   └── logo-ubb-login.png
│   ├── src/
│   │   ├── api/               # Clientes de comunicación con el backend (Axios/Fetch)
│   │   ├── components/        # Componentes UI (Navbar, Tabla, Modales, Métricas)
│   │   ├── context/           # Contexto global de autenticación (AuthContext)
│   │   ├── pages/             # Vistas principales (LoginPage, DashboardPage)
│   │   ├── App.jsx            # Enrutador y control de sesión
│   │   └── index.css          # Sistema de diseño y variables institucionales UBB
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── client/                    # Proyecto del videojuego en Godot Engine
│   └── nuevo-proyecto-de-juego/
│       └── project.godot
│
└── database/                  # Migraciones y scripts SQL
    └── migrations/
```

---

## Instalación y Configuración

### Prerrequisitos

Asegúrate de contar con las siguientes herramientas instaladas:

- [Node.js](https://nodejs.org/) (Versión 18.x o 20.x LTS recomendada).
- [Git](https://git-scm.com/) para el control de versiones.
- [PostgreSQL](https://www.postgresql.org/) (Versión 14 o superior).
- [Godot Engine 4](https://godotengine.org/) (Opcional, para editar o ejecutar el cliente del juego).

### Clonación del Repositorio

Clona el repositorio en tu máquina local:

```bash
git clone https://github.com/zZSkimens/ProyectoTesisUBB.git
cd ProyectoTesisUBB
```

### Configuración del Backend

1. Ingresa a la carpeta del backend:

```bash
cd backend
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea o edita el archivo `.env` con los parámetros correspondientes:

```env
# Servidor
HOST=localhost
PORT=3000

# Base de datos PostgreSQL
DB_PORT=5432
DB_USERNAME=postgres
PASSWORD=tu_contraseña
DATABASE=tesis

# Seguridad y JWT
ACCESS_TOKEN_SECRET=tu_clave_secreta_jwt
cookieKey=tu_clave_de_cookie
```

4. Ejecuta la carga de datos de prueba iniciales:

```bash
npm run db:seed
```

5. Inicia el servidor en modo desarrollo:

```bash
npm run dev
```

El backend quedará escuchando en `http://localhost:3000`.

### Configuración del Frontend

1. En una nueva terminal, ingresa a la carpeta del panel web:

```bash
cd tutor-panel
```

2. Instala las dependencias:

```bash
npm install
```

3. Inicia el servidor de desarrollo Vite:

```bash
npm run dev
```

4. Abre tu navegador web en `http://localhost:5173`.

---

## Tecnologías

### Node.js y Express
- **Uso**: Servidor y API REST encargada del manejo de rutas, reglas de negocio y conexión a la base de datos.
- **Enlace**: [Express.js](https://expressjs.com/)

### React y Vite
- **Uso**: Interfaz de usuario dinámica, reactiva y optimizada para el panel de administración de los tutores.
- **Enlace**: [React](https://react.dev/) • [Vite](https://vitejs.dev/)

### PostgreSQL y Drizzle ORM
- **Uso**: Base de datos relacional para la persistencia de usuarios, estudiantes novatos y registro de misiones completadas.
- **Enlace**: [PostgreSQL](https://www.postgresql.org/) • [Drizzle ORM](https://orm.drizzle.team/)

### Godot Engine
- **Uso**: Motor gráfico para el desarrollo del videojuego 2D/3D de inducción universitaria.
- **Enlace**: [Godot Engine](https://godotengine.org/)

### Librerías Clave
- **bcryptjs**: Cifrado y verificación segura de contraseñas.
- **jsonwebtoken (JWT)**: Manejo de sesiones sin estado basadas en tokens.
- **lucide-react**: Iconografía moderna y ligera para la interfaz web.
- **dotenv**: Gestión centralizada de variables de entorno.
