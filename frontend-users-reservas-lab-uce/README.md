# Frontend de Reservas para Estudiantes - Universidad Central del Ecuador

## Descripcion General

Esta aplicacion constituye la interfaz de usuario destinada a los estudiantes de la Universidad Central del Ecuador para la gestion de reservas de laboratorios informaticos. Desarrollada con React 19, TypeScript y Vite, provee un flujo completo que abarca el registro de cuenta, inicio de sesion, exploracion del catalogo de laboratorios, seleccion de horarios disponibles, confirmacion de reservas y administracion del historial personal. La aplicacion consume la API REST del sistema mediante Axios y gestiona el estado global con Zustand.

---

## Tabla de Contenidos

1. [Tecnologias utilizadas](#tecnologias-utilizadas)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Variables de entorno](#variables-de-entorno)
4. [Instalacion y ejecucion](#instalacion-y-ejecucion)
5. [Arquitectura de la aplicacion](#arquitectura-de-la-aplicacion)
   - [Enrutamiento](#enrutamiento)
   - [Gestion de estado](#gestion-de-estado)
   - [Cliente HTTP](#cliente-http)
6. [Paginas y funcionalidades](#paginas-y-funcionalidades)
   - [Pagina de inicio de sesion](#pagina-de-inicio-de-sesion-login)
   - [Pagina de registro](#pagina-de-registro-register)
   - [Panel principal del estudiante](#panel-principal-del-estudiante-)
   - [Pagina de reserva](#pagina-de-reserva-reservarlabid)
7. [Componentes](#componentes)
8. [Seguridad y gestion de sesion](#seguridad-y-gestion-de-sesion)
9. [Integracion con configuraciones del sistema](#integracion-con-configuraciones-del-sistema)
10. [Despliegue](#despliegue)

---

## Tecnologias utilizadas

| Tecnologia         | Version  | Proposito                                                  |
|--------------------|----------|------------------------------------------------------------|
| React              | 19.x     | Libreria principal de construccion de interfaz de usuario  |
| TypeScript         | 5.9.x    | Tipado estatico                                            |
| Vite               | 7.x      | Herramienta de construccion y servidor de desarrollo       |
| React Router DOM   | 7.x      | Enrutamiento declarativo del lado del cliente              |
| Zustand            | 5.x      | Gestion de estado global con persistencia en sessionStorage|
| Axios              | 1.x      | Cliente HTTP para comunicacion con la API REST             |
| Framer Motion      | 12.x     | Animaciones y transiciones de pagina                       |
| Tailwind CSS       | 4.x      | Framework de estilos utilitario                            |
| Sonner             | 2.x      | Sistema de notificaciones tipo toast                       |
| Lucide React       | 0.575.x  | Libreria de iconos                                         |
| clsx               | 2.x      | Utilidad para composicion condicional de clases CSS        |
| tailwind-merge     | 3.x      | Fusion de clases de Tailwind sin conflictos                |

---

## Estructura del proyecto

```
frontend-users-reservas-lab-uce/
├── src/
│   ├── main.tsx                    # Punto de entrada: monta la aplicacion en el DOM
│   ├── App.tsx                     # Configuracion del enrutador y definicion de rutas
│   ├── App.css                     # Estilos globales de la aplicacion
│   ├── index.css                   # Variables CSS base y reset
│   ├── pages/
│   │   ├── LoginPage.tsx           # Pagina de inicio de sesion
│   │   ├── RegisterPage.tsx        # Pagina de registro de nuevos estudiantes
│   │   ├── Dashboard.tsx           # Panel principal con laboratorios y mis reservas
│   │   └── BookingPage.tsx         # Pagina de seleccion y confirmacion de reserva
│   ├── components/
│   │   ├── Layout.tsx              # Contenedor base con Navbar que envuelve las rutas protegidas
│   │   ├── Navbar.tsx              # Barra de navegacion superior con saludo y boton de cierre de sesion
│   │   ├── ProtectedRoute.tsx      # Guardia de ruta: redirige a /login si no hay token
│   │   ├── SessionTimer.tsx        # Temporizador visual regresivo de sesion (10 minutos)
│   │   ├── PageTransition.tsx      # Wrapper de animacion para transiciones entre paginas
│   │   └── ui/                     # Componentes de interfaz reutilizables (Button, Input, Modal)
│   ├── store/
│   │   └── useAuthStore.ts         # Store de Zustand para autenticacion, persistido en sessionStorage
│   ├── hooks/
│   │   └── useSessionTimeout.ts    # Hook de cierre de sesion automatico por inactividad
│   ├── lib/
│   │   ├── api.ts                  # Instancia configurada de Axios con interceptores de token
│   │   └── settings.service.ts     # Servicio para consumir configuraciones globales del sistema
│   ├── types/
│   │   └── index.ts                # Definiciones de tipos e interfaces compartidas
│   └── assets/                     # Recursos estaticos (imagenes, fuentes, etc.)
├── public/                         # Archivos publicos servidos directamente
├── index.html                      # Documento HTML raiz
├── vite.config.ts                  # Configuracion de Vite y plugins
├── nixpacks.toml                   # Configuracion de entorno para despliegue en Railway
├── vercel.json                     # Configuracion de reescritura de rutas para despliegue en Vercel
├── tsconfig.json                   # Configuracion base de TypeScript
├── tsconfig.app.json               # Configuracion de TypeScript para el codigo de la aplicacion
└── package.json                    # Dependencias y scripts del proyecto
```

---

## Variables de entorno

La aplicacion requiere una variable de entorno accesible durante el proceso de construccion:

| Variable              | Descripcion                                       | Ejemplo                          |
|-----------------------|---------------------------------------------------|----------------------------------|
| `VITE_API_URL`        | URL base de la API REST de backend                | `http://45.90.237.228:8080`      |

Esta variable debe definirse en un archivo `.env` en la raiz del proyecto para desarrollo local, o como variable de entorno en la plataforma de despliegue. Al ser un proyecto Vite, la variable debe estar prefijada con `VITE_` para ser accesible desde el codigo del cliente.

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

Inicia el servidor de desarrollo de Vite con recarga en caliente (HMR). La aplicacion estara disponible en `http://localhost:5173` por defecto.

### Compilacion para produccion

```bash
npm run build
```

Ejecuta la verificacion de tipos de TypeScript (`tsc -b`) seguida de la construccion optimizada de Vite. Los archivos resultantes se generan en el directorio `dist/`.

### Previsualizar build de produccion localmente

```bash
npm run preview
```

---

## Arquitectura de la aplicacion

### Enrutamiento

La aplicacion utiliza `react-router-dom` con `BrowserRouter` para la gestion de rutas del lado del cliente. La estructura de rutas es la siguiente:

| Ruta                  | Componente       | Tipo         | Descripcion                                                      |
|-----------------------|------------------|--------------|------------------------------------------------------------------|
| `/login`              | `LoginPage`      | Publica      | Formulario de inicio de sesion                                   |
| `/register`           | `RegisterPage`   | Publica      | Formulario de registro de cuenta nueva                           |
| `/`                   | `Dashboard`      | Protegida    | Panel principal del estudiante con laboratorios y reservas       |
| `/reservar/:labId`    | `BookingPage`    | Protegida    | Seleccion de fecha, horario y confirmacion de reserva            |
| `*`                   | Redireccion      | -            | Cualquier ruta no definida redirige a `/`                        |

Las rutas protegidas estan envueltas por el componente `ProtectedRoute`, que verifica la existencia de un token en el store de Zustand. En caso de ausencia, redirige al usuario a `/login` de forma inmediata.

Las rutas protegidas tambien estan contenidas dentro del componente `Layout`, que renderiza la barra de navegacion superior en todas las paginas autenticadas.

Las transiciones entre paginas estan animadas mediante el componente `PageTransition`, que utiliza Framer Motion para efectos de entrada suaves.

### Gestion de estado

El estado global de autenticacion se gestiona con Zustand a traves del store `useAuthStore`. Este store implementa el middleware `persist` de Zustand, lo que garantiza que el estado de sesion sobreviva recargas de pagina dentro de la misma sesion del navegador. El medio de almacenamiento utilizado es `sessionStorage`, lo que implica que la sesion se limpia automaticamente al cerrar la pestana o el navegador.

El store expone las siguientes propiedades y acciones:

| Propiedad / Accion | Tipo                  | Descripcion                                                                       |
|--------------------|-----------------------|-----------------------------------------------------------------------------------|
| `token`            | `string / null`       | Token JWT de la sesion activa                                                     |
| `user`             | `User / null`         | Informacion del usuario autenticado (`full_name`, `role`)                         |
| `role`             | `string / null`       | Rol del usuario autenticado                                                       |
| `loginTime`        | `number / undefined`  | Marca de tiempo Unix del momento del inicio de sesion, utilizada por `SessionTimer` |
| `login()`          | `async`               | Llama a `POST /auth/login` y persiste el estado resultante                        |
| `register()`       | `async`               | Llama a `POST /auth/register` y persiste el estado resultante                     |
| `logout()`         | `void`                | Limpia todos los campos del store (token, user, role, loginTime)                  |

### Cliente HTTP

El cliente HTTP se instancia con Axios y se configura con la URL base definida en `VITE_API_URL`. Incorpora un interceptor de solicitud que agrega automaticamente el encabezado `Authorization: Bearer <token>` a todas las peticiones cuando existe un token activo en el store de Zustand, eliminando la necesidad de gestion manual del encabezado en cada llamada a la API.

---

## Paginas y funcionalidades

### Pagina de inicio de sesion (`/login`)

Presenta un formulario con campos de correo electronico y contrasena. Al enviar las credenciales, invoca la accion `login()` del store de Zustand, que realiza la solicitud `POST /auth/login` a la API. Si la respuesta es exitosa, el token y la informacion del usuario quedan persistidos en `sessionStorage` y el usuario es redirigido al panel principal (`/`). En caso de error, se muestra un toast descriptivo con el mensaje retornado por la API.

### Pagina de registro (`/register`)

Formulario de creacion de cuenta nueva con los campos de nombre completo, correo electronico institucional y contrasena. Invoca la accion `register()` del store, que realiza la solicitud `POST /auth/register`. Tras un registro exitoso, el usuario queda autenticado directamente y es redirigido al panel principal sin necesidad de un segundo inicio de sesion. El correo electronico debe pertenecer al dominio `@uce.edu.ec`, restriccion validada por la API.

### Panel principal del estudiante (`/`)

El dashboard es la pagina central de la aplicacion y esta organizada en dos pestanas:

**Pestana "Laboratorios"**

Muestra el catalogo completo de laboratorios obtenido de `GET /labs`. Para cada laboratorio se presentan:

- Nombre y capacidad maxima.
- Indicador visual del estado operativo: disponible (verde), en mantenimiento (amarillo) o inhabilitado (rojo).
- Boton de reserva que navega a `/reservar/:labId`. El boton se deshabilita cuando el laboratorio no esta disponible.

La disponibilidad de cada laboratorio considera dos factores adicionales provenientes de las configuraciones del sistema:
- Si la politica `operational_policies.emergency_lockdown` esta activa, todos los laboratorios se muestran como inhabilitados con la etiqueta "Plataforma Bloqueada", independientemente de su estado individual.
- Si `communication_banners.is_active` esta activo, se muestra un banner informativo global en la parte superior del dashboard con el mensaje configurado por el administrador.

**Pestana "Mis Reservas"**

Muestra el historial de reservas del usuario autenticado obtenido de `GET /labs/mis-reservas`. Las reservas individuales se agrupan por laboratorio, fecha y materia para presentar bloques de horas continuas como una unica entrada en la tabla. Cada grupo muestra:

- Nombre del laboratorio.
- Fecha en formato `DD/MM/YYYY`.
- Rango horario (hora de inicio a hora de fin del bloque).
- Nombre de la materia.
- Duracion total en horas.
- Estado calculado: `Activa` (verde) si la reserva es presente o futura, `Finalizada` (gris) si ya transcurrio.

Solo las reservas con estado `Activa` presentan un boton de cancelacion. Al presionarlo, se abre un modal de confirmacion. Tras confirmar, se envian solicitudes `DELETE /labs/reservas/:id` para cada ID del grupo de forma paralela. Los datos del dashboard se actualizan silenciosamente cada 10 segundos en segundo plano mediante `setInterval`.

El temporizador de sesion `SessionTimer` se renderiza en el encabezado del dashboard y muestra el tiempo restante de sesion en formato `MM:SS`. Durante el ultimo minuto, el contador cambia a color rojo y activa una animacion pulsante para alertar al usuario.

### Pagina de reserva (`/reservar/:labId`)

Permite al usuario configurar y confirmar una reserva para un laboratorio especifico. La pagina esta organizada en un esquema de dos columnas:

**Columna izquierda: controles de configuracion**

- **Selector de fecha:** Acepta unicamente fechas a partir del dia actual. El limite maximo de dias hacia adelante se determina dinamicamente a partir de la configuracion del sistema `booking_rules.max_days_advance`. Si el usuario selecciona un dia sabado o domingo, la seleccion es rechazada con un mensaje de alerta, ya que las reservas solo estan habilitadas de lunes a viernes.
- **Campo de materia / motivo:** Texto libre que identifica el proposito de la reserva.
- **Panel de resumen:** Muestra las horas seleccionadas como etiquetas y el total acumulado. Contiene el boton "Confirmar Reserva", deshabilitado hasta que se seleccione al menos una hora y se complete el campo de materia.

**Columna derecha: grilla de disponibilidad horaria**

Una vez seleccionada la fecha, se consulta `GET /labs/disponibilidad?lab_id=:id&fecha=:fecha` y se renderiza una grilla de tarjetas horarias. Los horarios mostrados se filtran segun los valores de `operational_policies.opening_time` y `operational_policies.closing_time` definidos en la configuracion del sistema. Cada tarjeta puede encontrarse en uno de los siguientes estados:

| Estado       | Descripcion                                                         |
|--------------|---------------------------------------------------------------------|
| Disponible   | La hora esta libre y puede ser seleccionada                         |
| Seleccionado | La hora ha sido marcada por el usuario (resaltada en negro)         |
| Ocupado      | La hora ya esta reservada por otro usuario (no interactuable)       |
| Pasado       | La hora ya transcurrio durante el dia actual (no interactuable)     |

El usuario puede seleccionar multiples horas no contiguas con un maximo de 6 horas por reserva. Si se intenta agregar una septima hora, se muestra un aviso. La disponibilidad se refresca silenciosamente cada 20 segundos para reflejar reservas realizadas por otros usuarios en tiempo real.

Si la politica `emergency_lockdown` esta activa, la grilla no se muestra y se presenta un mensaje bloqueante que indica que las reservas estan suspendidas.

Al confirmar, se realiza una unica solicitud `POST /labs/reservar` con el arreglo completo de horas seleccionadas. Tras una respuesta exitosa, el usuario es redirigido al panel principal.

---

## Componentes

### `Layout`

Componente contenedor que envuelve todas las rutas protegidas. Renderiza el `Navbar` en la parte superior y delega el contenido principal al componente hijo correspondiente.

### `Navbar`

Barra de navegacion persistente en todas las paginas protegidas. Muestra el logotipo "Laboratorios UCE" vinculado a la ruta raiz, el saludo contextual dependiente de la hora del dia (buenos dias, buenas tardes o buenas noches), el nombre completo del usuario autenticado y un boton de cierre de sesion que invoca `logout()` del store y redirige a `/login`.

### `ProtectedRoute`

Componente de guardia implementado con el patron `Outlet` de React Router. Verifica la existencia de un token en el store de Zustand. Si no existe, ejecuta una redireccion inmediata a `/login` mediante `Navigate`. Si el token existe, renderiza el contenido de la ruta anidada.

### `SessionTimer`

Componente visual que muestra una cuenta regresiva del tiempo de sesion restante. Calcula el tiempo transcurrido desde `loginTime` (almacenado en el store al momento del login) y lo compara contra una duracion fija de 10 minutos. Cuando el tiempo llega a cero, ejecuta `logout()` y redirige al usuario a `/login` con un mensaje informativo. Durante el ultimo minuto, el color del contador cambia a rojo y activa una animacion `animate-pulse`.

### `PageTransition`

Wrapper ligero que aplica animaciones de entrada y salida de pagina mediante Framer Motion, proporcionando transiciones suaves entre las distintas vistas de la aplicacion.

---

## Seguridad y gestion de sesion

La aplicacion implementa un mecanismo dual de cierre de sesion automatico:

### 1. Cierre de sesion por tiempo absoluto (`SessionTimer`)

Independientemente de la actividad del usuario, la sesion expira transcurridos exactamente 10 minutos desde el momento del login. Este tiempo se calcula comparando `Date.now()` contra el valor `loginTime` persistido en el store. El temporizador es visible para el usuario en todo momento en el encabezado del panel principal.

### 2. Cierre de sesion por inactividad (`useSessionTimeout`)

Un temporizador adicional de 10 minutos se reinicia cada vez que el usuario realiza una de las siguientes acciones de interaccion: `mousedown`, `keydown`, `scroll` o `touchstart`. Si transcurren 10 minutos sin ninguna de estas acciones, la sesion se cierra automaticamente y el usuario es redirigido a `/login` con el aviso "Su sesion ha expirado por inactividad.".

Ambos mecanismos operan de forma independiente. El temporizador absoluto garantiza una vida maxima de sesion fija, mientras que el de inactividad protege cuentas desatendidas en sesiones prolongadas.

El token JWT se almacena exclusivamente en `sessionStorage`, lo que garantiza que nunca persista mas alla de la sesion actual del navegador. Al cerrar la pestana o el navegador, el token es eliminado automaticamente por el entorno de ejecucion del navegador.

---

## Integracion con configuraciones del sistema

La aplicacion consume en tiempo real las configuraciones globales del sistema a traves del servicio `SettingsService`, que llama a `GET /settings`. Las configuraciones son leidas tanto en el `Dashboard` como en la `BookingPage` y afectan el comportamiento de la aplicacion de la siguiente manera:

| Clave de configuracion                          | Efecto en el frontend                                                                         |
|-------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `operational_policies.emergency_lockdown`       | Bloquea todos los laboratorios y deshabilita la grilla de reservas si su valor es `true`      |
| `operational_policies.opening_time`             | Define la hora de apertura; los turnos anteriores no se muestran en la grilla                 |
| `operational_policies.closing_time`             | Define la hora de cierre; los turnos a partir de esta hora no se muestran en la grilla        |
| `booking_rules.max_days_advance`                | Establece el limite maximo de dias hacia adelante para el selector de fecha en la reserva     |
| `communication_banners.is_active`               | Habilita la visualizacion del banner de aviso en el dashboard si su valor es `true`           |
| `communication_banners.global_message`          | Texto del aviso de administracion mostrado en el banner cuando este esta activo               |

---

## Despliegue

### Despliegue en Railway (Nixpacks)

El archivo `nixpacks.toml` configura el entorno de construccion para Railway:

```toml
[phases.setup]
nixPkgs = ["nodejs_20"]
```

Railway detecta automaticamente el proyecto como una aplicacion Node.js y ejecuta `npm run build` seguido de `npm run preview` para servir los archivos estaticos.

### Despliegue en Vercel

El archivo `vercel.json` configura una regla de reescritura que redirige todas las rutas al `index.html`, lo cual es necesario para que el enrutamiento del lado del cliente de React Router funcione correctamente al acceder directamente a rutas distintas de la raiz:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
