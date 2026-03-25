# Panel de Administracion - Sistema de Reservas de Laboratorios UCE

## Descripcion General

Este proyecto constituye el panel de control administrativo del Sistema de Reservas de Laboratorios de la Universidad Central del Ecuador. Desarrollado con Next.js 16 y TypeScript, esta aplicacion esta destinada exclusivamente al personal administrativo con rol `admin`. Provee una interfaz completa para la supervision en tiempo real de la disponibilidad de laboratorios mediante un calendario interactivo, la gestion del directorio de usuarios, la administracion del catalogo de laboratorios, el control del historial de reservas del sistema y la modificacion de las politicas globales de operacion.

---

## Tabla de Contenidos

1. [Tecnologias utilizadas](#tecnologias-utilizadas)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Variables de entorno](#variables-de-entorno)
4. [Instalacion y ejecucion](#instalacion-y-ejecucion)
5. [Arquitectura de la aplicacion](#arquitectura-de-la-aplicacion)
   - [Enrutamiento con App Router](#enrutamiento-con-app-router)
   - [Capa de servicios](#capa-de-servicios)
   - [Gestion de estado](#gestion-de-estado)
6. [Autenticacion](#autenticacion)
7. [Secciones del dashboard](#secciones-del-dashboard)
   - [Inicio](#inicio-dashboard)
   - [Calendario](#calendario-dashboardcalendario)
   - [Laboratorios](#laboratorios-dashboardlaboratorios)
   - [Historial de Reservas](#historial-de-reservas-dashboardhistorial-reservas)
   - [Usuarios](#usuarios-dashboardusuarios)
   - [Ajustes Globales](#ajustes-globales-dashboardajustes)
8. [Componentes del dashboard](#componentes-del-dashboard)
9. [Despliegue](#despliegue)

---

## Tecnologias utilizadas

| Tecnologia              | Version  | Proposito                                                          |
|-------------------------|----------|--------------------------------------------------------------------|
| Next.js                 | 16.x     | Framework principal con App Router y renderizado del lado servidor |
| React                   | 19.x     | Libreria de interfaz de usuario                                    |
| TypeScript              | 5.x      | Tipado estatico                                                    |
| Tailwind CSS            | 4.x      | Framework de estilos utilitario                                    |
| Framer Motion           | 12.x     | Animaciones y transiciones de componentes                          |
| Zustand                 | 5.x      | Gestion de estado global para notificaciones                       |
| Radix UI                | 1.x      | Primitivos accesibles para Dialog, Select y otros componentes      |
| Shadcn UI               | 3.x      | Sistema de componentes basado en Radix UI con estilos personalizados|
| React Hook Form         | 7.x      | Gestion de formularios                                             |
| Zod                     | 4.x      | Validacion de esquemas en formularios                              |
| date-fns                | 4.x      | Procesamiento y formateo de fechas                                 |
| Sonner                  | 2.x      | Sistema de notificaciones tipo toast                               |
| Lucide React            | 0.575.x  | Libreria de iconos                                                 |
| class-variance-authority| 0.7.x    | Variantes de estilos para componentes                              |
| tailwind-merge          | 3.x      | Fusion de clases de Tailwind sin conflictos                        |

---

## Estructura del proyecto

```
frontend-admin-dashboard-lab-uce/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Layout raiz: Toaster y configuracion global
│   │   ├── page.tsx                      # Pagina raiz: redirige a /dashboard o /login
│   │   ├── globals.css                   # Estilos globales y variables CSS del tema oscuro
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── LoginForm.tsx         # Formulario de inicio de sesion para administradores
│   │   └── dashboard/
│   │       ├── layout.tsx                # Layout del dashboard: Sidebar + contenido
│   │       ├── page.tsx                  # Inicio: metricas, notificaciones y panel de novedades
│   │       ├── calendario/
│   │       │   └── page.tsx              # Vista de calendario interactivo por laboratorio
│   │       ├── laboratorios/
│   │       │   └── page.tsx              # CRUD completo del catalogo de laboratorios
│   │       ├── historial-reservas/
│   │       │   └── page.tsx              # Historial global de reservas con busqueda y filtros
│   │       ├── usuarios/
│   │       │   ├── page.tsx              # Directorio de usuarios con gestion de cuentas
│   │       │   └── [id]/                 # Perfil detallado individual de usuario
│   │       └── ajustes/
│   │           └── page.tsx              # Panel de control global del sistema
│   ├── components/
│   │   ├── Sidebar.tsx                   # Barra de navegacion lateral vertical persistente
│   │   ├── dashboard/
│   │   │   ├── TopHeader.tsx             # Encabezado superior con busqueda y notificaciones
│   │   │   ├── MainCalendar.tsx          # Componente de calendario interactivo con grid horario
│   │   │   ├── RightPanel.tsx            # Panel lateral derecho del calendario con reservas del dia
│   │   │   ├── ReservationModal.tsx      # Modal de creacion de nueva reserva desde el calendario
│   │   │   └── ViewReservationModal.tsx  # Modal de detalle de reserva existente
│   │   └── ui/                           # Componentes UI base (Button, Dialog, Input, Select, etc.)
│   ├── services/
│   │   ├── api.ts                        # Cliente HTTP con gestion de token y manejo de errores
│   │   ├── auth.service.ts               # Servicio de autenticacion (login, logout, getUser)
│   │   ├── lab.service.ts                # Servicio de laboratorios y reservas (CRUD completo)
│   │   ├── user.service.ts               # Servicio de gestion de usuarios
│   │   └── settings.service.ts           # Servicio de configuraciones globales del sistema
│   ├── store/
│   │   └── notificationsStore.ts         # Store de Zustand para el sistema de notificaciones internas
│   └── lib/
│       └── utils.ts                      # Utilitarios de clases CSS (cn helper)
├── nixpacks.toml                         # Configuracion de entorno para despliegue en Railway
├── next.config.ts                        # Configuracion de Next.js
├── tailwind.config.ts                    # Configuracion de Tailwind CSS
└── package.json                          # Dependencias y scripts del proyecto
```

---

## Variables de entorno

| Variable                | Descripcion                                           | Ejemplo                         |
|-------------------------|-------------------------------------------------------|---------------------------------|
| `NEXT_PUBLIC_API_URL`   | URL base de la API REST de backend                    | `http://45.90.237.228:8080`     |
| `NIXPACKS_NODE_VERSION` | Version de Node.js utilizada en el entorno de build   | `20`                            |

La variable `NEXT_PUBLIC_API_URL` debe estar definida en el entorno de despliegue. Al estar prefijada con `NEXT_PUBLIC_`, es accesible desde el codigo de cliente.

---

## Instalacion y ejecucion

### Prerrequisitos

- Node.js 20 o superior
- Acceso a la API REST del sistema en ejecucion

### Instalacion de dependencias

```bash
npm install
```

### Ejecucion en desarrollo

```bash
npm run dev
```

Inicia el servidor de desarrollo de Next.js. La aplicacion estara disponible en `http://localhost:3000`.

### Compilacion para produccion

```bash
npm run build
```

Genera el bundle de Next.js optimizado para produccion.

### Ejecucion en produccion

```bash
npm run start
```

Inicia el servidor de Next.js sobre el build previamente compilado.

---

## Arquitectura de la aplicacion

### Enrutamiento con App Router

El proyecto utiliza el App Router de Next.js. La estructura de rutas es la siguiente:

| Ruta                                   | Descripcion                                                              |
|----------------------------------------|--------------------------------------------------------------------------|
| `/`                                    | Redirige al dashboard o al login segun el estado de sesion               |
| `/login`                               | Formulario de autenticacion para administradores                         |
| `/dashboard`                           | Inicio del panel: metricas y notificaciones                              |
| `/dashboard/calendario`                | Calendario interactivo de disponibilidad por laboratorio                 |
| `/dashboard/laboratorios`              | CRUD del catalogo de laboratorios                                        |
| `/dashboard/historial-reservas`        | Historial global de todas las reservas del sistema                       |
| `/dashboard/usuarios`                  | Directorio completo de usuarios del sistema                              |
| `/dashboard/usuarios/:id`              | Perfil detallado y edicion individual de un usuario                      |
| `/dashboard/ajustes`                   | Panel de control global: politicas, comunicados y mantenimiento          |

Todas las rutas bajo `/dashboard` estan envueltas por el layout del dashboard (`dashboard/layout.tsx`), que renderiza el `Sidebar` y verifica el estado de sesion. Si el token no esta presente en `localStorage`, el usuario es redirigido automaticamente a `/login`.

### Capa de servicios

El proyecto implementa una capa de abstraccion de servicios mediante clases de tipo Facade, una por modulo de la API. Cada servicio instancia el cliente HTTP centralizado (`api.ts`) y expone metodos tipados. Esta separacion garantiza que los componentes no realicen llamadas HTTP directas.

| Servicio            | Clase                  | Responsabilidad                                               |
|---------------------|------------------------|---------------------------------------------------------------|
| `auth.service.ts`   | `AuthServiceFacade`    | Login, logout, recuperacion del usuario desde `localStorage`  |
| `lab.service.ts`    | `LabServiceFacade`     | CRUD de laboratorios, consulta de disponibilidad y reservas   |
| `user.service.ts`   | `UserServiceFacade`    | Listado, creacion, edicion y cambio de contrasena de usuarios |
| `settings.service.ts`| `SettingsServiceFacade`| Lectura, escritura de configuraciones y purga del historial   |

El cliente HTTP (`api.ts`) agrega automaticamente el encabezado `Authorization: Bearer <token>` a todas las solicitudes leyendo el token desde `localStorage`. En caso de recibir una respuesta `401` o `403`, limpia la sesion y redirige al usuario a `/login`.

### Gestion de estado

El unico store global de la aplicacion es `useNotificationStore`, implementado con Zustand y persistido en `localStorage` mediante el middleware `persist`. Gestiona el sistema de notificaciones internas del administrador:

| Campo / Accion          | Tipo              | Descripcion                                                              |
|-------------------------|-------------------|--------------------------------------------------------------------------|
| `notifications`         | `Reservation[]`   | Lista de reservas recientes que constituyen notificaciones               |
| `dismissedIds`          | `number[]`        | IDs de notificaciones descartadas permanentemente para evitar duplicados |
| `unreadCount`           | `number`          | Contador de notificaciones no leidas mostrado en el encabezado           |
| `addNotifications()`    | `void`            | Agrega nuevas reservas al store evitando duplicados y rechazando descartadas |
| `removeNotification()`  | `void`            | Descarta una notificacion individual y la agrega a `dismissedIds`        |
| `clearAllNotifications()`| `void`           | Descarta todas las notificaciones activas de una vez                     |
| `clearUnread()`         | `void`            | Resetea el contador de no leidas a cero                                  |

---

## Autenticacion

El panel de administracion implementa autenticacion basada en JWT almacenado en `localStorage`. El flujo es el siguiente:

1. El administrador ingresa sus credenciales en el formulario de `/login`.
2. `AuthService.login()` realiza `POST /auth/login`. La API valida que el usuario posea el rol `admin` y que su cuenta este activa antes de emitir el token.
3. El token JWT, el nombre completo (`full_name`) y el rol se almacenan en `localStorage`.
4. El interceptor de `api.ts` incluye el token en cada solicitud posterior.
5. Al cerrar sesion mediante el boton "Salir" del `Sidebar`, `AuthService.logout()` limpia `localStorage` y redirige a `/login`.

Si el token expira o una solicitud retorna `401`/`403`, el interceptor ejecuta el mismo proceso de limpieza y redireccion automaticamente.

---

## Secciones del dashboard

### Inicio (`/dashboard`)

Pagina central del panel. Carga en paralelo el listado completo de laboratorios y todas las reservas del sistema. Presenta:

- **Metricas globales en tiempo real:** Total de laboratorios registrados, total de reservas activas, total de reservas finalizadas y total de usuarios en el sistema (obtenido de `GET /users`).
- **Sistema de notificaciones:** El `TopHeader` compara los datos de reservas con el store `useNotificationStore`. Las reservas activas que no han sido descartadas previamente son registradas como notificaciones nuevas. El icono de campana muestra un contador de no leidas. Al abrir el panel de notificaciones, `clearUnread()` se invoca para resetear el contador.
- **Panel de novedades de laboratorios:** Lista de laboratorios con su estado operativo y acciones rapidas de navegacion.

Los datos se recargan en segundo plano con un intervalo automatico para mantener las metricas actualizadas sin necesidad de recargar la pagina.

### Calendario (`/dashboard/calendario`)

Vista de calendario interactivo de disponibilidad horaria. Permite al administrador visualizar, en una grilla de horas por laboratorio, el estado de ocupacion de cada turno para cualquier fecha seleccionada. Funcionalidades principales:

- **Seleccion de fecha y laboratorio:** Controles en el `TopHeader` o panel superior que accionan la consulta de disponibilidad.
- **Grilla horaria (`MainCalendar`):** Renderiza cada hora del dia como una celda con estado visual: libre, ocupado o seleccionado. Las celdas ocupadas muestran el nombre del solicitante y la materia.
- **Panel lateral de detalle (`RightPanel`):** Al seleccionar un dia o reserva, muestra el listado de reservas existentes para esa fecha con informacion del solicitante, laboratorio, materia y horario.
- **Modal de nueva reserva (`ReservationModal`):** Permite al administrador crear una reserva directamente desde el calendario en nombre de un usuario, seleccionando laboratorio, fecha, horas y materia.
- **Modal de detalle (`ViewReservationModal`):** Muestra la informacion completa de una reserva existente al hacer clic sobre una celda ocupada.

### Laboratorios (`/dashboard/laboratorios`)

Directorio de laboratorios con operaciones de creacion, edicion y eliminacion. Caracteristicas:

- **Busqueda en tiempo real:** Campo de busqueda que filtra instantaneamente la lista por nombre o ubicacion del laboratorio.
- **Tarjetas animadas:** Cada laboratorio se presenta en una tarjeta con estado visual codificado por color (verde para disponible, amarillo para mantenimiento, rojo para inhabilitado) y animacion de entrada escalonada mediante Framer Motion.
- **Creacion de laboratorio:** El boton "Nuevo Laboratorio" abre un modal con campos para nombre, ubicacion, capacidad y estado operativo. Llama a `POST /labs` al confirmar.
- **Edicion de laboratorio:** El boton de edicion en cada tarjeta pre-rellena el modal con los datos actuales y llama a `PUT /labs/:id` al guardar.
- **Eliminacion de laboratorio:** Requiere confirmacion mediante `window.confirm`. La operacion solo es posible si no existen reservas vinculadas al laboratorio; si las hay, la API rechaza la eliminacion con un mensaje descriptivo que se muestra como toast.

### Historial de Reservas (`/dashboard/historial-reservas`)

Vista de administracion global sobre todas las reservas del sistema, obtenidas de `GET /labs/todas-reservas`. Funcionalidades:

- **Busqueda combinada:** Filtra por nombre del solicitante, nombre del laboratorio, nombre de la materia o ID de reserva.
- **Filtro por estado:** Selector que permite mostrar todas las reservas, solo las activas o solo las finalizadas.
- **Acciones por fila:**
  - **Ver detalles:** Abre un modal con informacion completa del solicitante (nombre, correo, ID) y de la reserva (laboratorio, materia, fecha, horario).
  - **Reagendar:** Disponible unicamente en reservas con estado `active`. Abre un modal con selector de nueva fecha y hora de inicio. Llama a `PATCH /labs/reservas/:id/reagendar`. La API valida que la nueva fecha no sea anterior a la actual y que la nueva hora no haya transcurrido.
  - **Cancelar:** Elimina la reserva permanentemente tras confirmacion del usuario. Llama a `DELETE /labs/reservas/:id`.

### Usuarios (`/dashboard/usuarios`)

Directorio completo de todos los usuarios registrados en el sistema. Permite:

- **Listado con busqueda y filtros:** Filtra por nombre, correo o rol. Indicador visual del estado de la cuenta (activo / inactivo).
- **Creacion de usuario:** Formulario completo con nombre, correo, contrasena, rol y estado. Llama a `POST /users`.
- **Edicion de usuario:** Actualiza nombre, correo, rol y estado. Llama a `PUT /users/:id`.
- **Restablecimiento de contrasena:** Permite al administrador forzar una nueva contrasena para cualquier usuario. Llama a `PUT /users/:id/password`.
- **Perfil individual (`/dashboard/usuarios/:id`):** Vista detallada del perfil de un usuario especifico con su historial de reservas personales.

### Ajustes Globales (`/dashboard/ajustes`)

Panel de control global del sistema con cuatro modulos independientes. Todos los cambios se aplican en tiempo real a la plataforma de estudiantes al guardar.

**Modulo 1: Limites de Agendamiento (`booking_rules`)**

Configura las restricciones numericas del motor de reservas:
- **Dias de anticipacion:** Numero maximo de dias hacia adelante que un estudiante puede reservar. Puede deshabilitarse para permitir reservas sin limite temporal. Afecta el atributo `max` del selector de fecha en la aplicacion de estudiantes.
- **Limite de horas semanales:** Total maximo de horas que una cuenta puede reservar por semana. Puede deshabilitarse para consumo ilimitado.

**Modulo 2: Politicas de Operacion Local (`operational_policies`)**

- **Hora de apertura y cierre:** Definen la ventana horaria visible en la grilla de disponibilidad. Los turnos fuera de este rango no se muestran a los estudiantes.
- **Protocolo de Cuarentena (Kill-Switch de emergencia):** Interruptor de emergencia que, al activarse, bloquea instantaneamente toda la plataforma para los estudiantes. En la aplicacion de estudiantes, todos los laboratorios aparecen como "Plataforma Bloqueada" y la grilla de reservas muestra un mensaje de suspension. El boton de guardar cambia a un estado de alerta rojo al activarse.

**Modulo 3: Cartelera Digital Informativa (`communication_banners`)**

Permite redactar un mensaje de aviso global y activarlo para que aparezca como un banner de notificacion en la pagina principal de todos los estudiantes. El administrador puede modificar el texto y habilitar o deshabilitar la visibilidad del banner de forma independiente.

**Modulo 4: Mantenimiento de Base de Datos**

Operacion de purga del historial de reservas de la base de datos. Al invocar la limpieza, se abre un modal de confirmacion con tres opciones seleccionables para indicar que categorias de registros eliminar:

| Categoria a purgar       | Descripcion                                                          |
|--------------------------|----------------------------------------------------------------------|
| Reservaciones Canceladas | Registros de reservas que fueron anuladas por estudiantes            |
| Reservaciones Finalizadas| Practicas ya concluidas cuya fecha y hora pasaron                    |
| Reservaciones Activas    | Reservas futuras que aun no han ocurrido (marcada como zona de peligro) |

La purga llama a `POST /settings/purge-history` con el arreglo de estados seleccionados. El resultado indica el numero de registros eliminados del servidor.

---

## Componentes del dashboard

### `Sidebar`

Barra de navegacion lateral vertical fija. Contiene el logotipo del sistema, los enlaces de navegacion a cada seccion con iconos y etiquetas, y el boton de cierre de sesion. Resalta automaticamente la seccion activa comparando el pathname actual mediante `usePathname` de Next.js.

### `TopHeader`

Encabezado superior del dashboard. Muestra el nombre del administrador autenticado (leido desde `localStorage`), un campo de busqueda global y el icono de notificaciones con el contador de no leidas. Al interactuar con el panel de notificaciones, lista las reservas recientes con opciones de navegacion y descarte.

### `MainCalendar`

Componente principal de la vista de calendario. Renderiza una grilla de celdas horarias organizadas por columnas de laboratorio y filas de hora del dia. Gestiona la seleccion de celdas, el color segun disponibilidad y la apertura de los modales de creacion y visualizacion de reservas.

### `RightPanel`

Panel lateral derecho que acompana al `MainCalendar`. Muestra el listado de reservas confirmadas para el dia y laboratorio seleccionados, con resumen de solicitante, materia y horario.

### `ReservationModal`

Modal de creacion de reserva administrativa. Permite seleccionar laboratorio, fecha, horas y materia. Llama a `LabService.createBooking()` al confirmar.

### `ViewReservationModal`

Modal de lectura de detalle de una reserva existente. Muestra todos los campos de la reserva incluyendo informacion del solicitante.

---

## Despliegue

### Despliegue en Railway (Nixpacks)

El archivo `nixpacks.toml` configura el entorno de construccion:

```toml
[phases.setup]
nixPkgs = ["nodejs_20"]
```

Railway detecta el proyecto como Next.js y ejecuta `npm run build` seguido de `npm run start`. La variable `NEXT_PUBLIC_API_URL` debe configurarse en el panel de variables de entorno de Railway antes del despliegue.
