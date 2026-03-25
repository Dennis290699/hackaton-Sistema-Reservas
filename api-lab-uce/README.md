# API de Reservas de Laboratorios - Universidad Central del Ecuador

## Descripcion General

Esta API REST provee el backend completo para el Sistema de Reservas de Laboratorios de la Universidad Central del Ecuador (UCE). Desarrollada con Node.js, Express y TypeScript, gestiona la autenticacion de usuarios, la administracion de laboratorios, el ciclo de vida de reservas y la configuracion global del sistema. La base de datos utilizada es PostgreSQL, conectada mediante la libreria `pg` con soporte SSL obligatorio.

---

## Tabla de Contenidos

1. [Tecnologias utilizadas](#tecnologias-utilizadas)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Variables de entorno](#variables-de-entorno)
4. [Instalacion y ejecucion](#instalacion-y-ejecucion)
5. [Autenticacion y autorizacion](#autenticacion-y-autorizacion)
6. [Referencia de la API](#referencia-de-la-api)
   - [Ruta de salud](#ruta-de-salud)
   - [Modulo de autenticacion](#modulo-de-autenticacion-auth)
   - [Modulo de laboratorios](#modulo-de-laboratorios-labs)
   - [Modulo de usuarios](#modulo-de-usuarios-users)
   - [Modulo de configuracion del sistema](#modulo-de-configuracion-del-sistema-settings)
7. [Modelos de datos](#modelos-de-datos)
8. [Logica de negocio relevante](#logica-de-negocio-relevante)
9. [Codigos de error estandarizados](#codigos-de-error-estandarizados)
10. [Politica de CORS](#politica-de-cors)

---

## Tecnologias utilizadas

| Tecnologia      | Version   | Proposito                                      |
|-----------------|-----------|------------------------------------------------|
| Node.js         | 20.x      | Entorno de ejecucion                           |
| Express         | 4.x       | Framework HTTP                                 |
| TypeScript      | 5.x       | Tipado estatico y transpilacion                |
| PostgreSQL       | -         | Base de datos relacional                       |
| pg              | 8.x       | Cliente de PostgreSQL para Node.js             |
| jsonwebtoken    | 9.x       | Generacion y verificacion de tokens JWT        |
| bcrypt          | 5.x       | Hashing seguro de contrasenas                  |
| zod             | 3.x       | Validacion de esquemas de entrada              |
| dotenv          | 16.x      | Gestion de variables de entorno                |
| cors            | 2.x       | Control de politica de origen cruzado          |
| nodemon         | 3.x       | Recarga automatica en desarrollo               |

---

## Estructura del proyecto

```
api-lab-uce/
├── src/
│   ├── server.ts              # Punto de entrada: configuracion de Express, CORS y registro de rutas
│   ├── db.ts                  # Instancia del pool de conexion a PostgreSQL
│   ├── auth/
│   │   ├── routes.ts          # Rutas publicas de autenticacion
│   │   ├── controller.ts      # Logica de login y registro
│   │   └── db.ts              # Acceso a datos de usuarios para autenticacion
│   ├── labs/
│   │   ├── routes.ts          # Rutas de gestion de laboratorios y reservas
│   │   ├── controller.ts      # Logica de disponibilidad, reservas y CRUD de laboratorios
│   │   └── db.ts              # Acceso a datos de laboratorios y reservas
│   ├── users/
│   │   ├── routes.ts          # Rutas de administracion de usuarios
│   │   ├── controller.ts      # Logica de listado, creacion, edicion y contrasenas
│   │   └── db.ts              # Acceso a datos del directorio de usuarios
│   ├── settings/
│   │   ├── routes.ts          # Rutas de configuracion del sistema
│   │   └── controller.ts      # Logica de lectura, escritura y purga del historial
│   └── middleware/
│       └── auth.ts            # Middlewares de autenticacion y autorizacion por rol
├── migrations/                # Scripts de migracion de base de datos
├── scripts/                   # Scripts auxiliares (migracion y seed)
├── dist/                      # Codigo compilado (generado por tsc)
├── package.json
└── tsconfig.json
```

---

## Variables de entorno

El archivo `.env` (o `.env.production` para produccion) debe definir las siguientes variables:

| Variable      | Descripcion                                                              | Ejemplo                             |
|---------------|--------------------------------------------------------------------------|-------------------------------------|
| `DATABASE_URL` | Cadena de conexion completa a PostgreSQL con modo SSL                   | `postgresql://user:nombre_base_de_datos@host/nombre_base_de_datos?sslmode=require` |
| `JWT_SECRET`  | Clave secreta utilizada para firmar y verificar los tokens JWT           | Cadena aleatoria de alta entropia   |
| `NODE_ENV`    | Entorno de ejecucion                                                     | `development` / `production`        |
| `PORT`        | Puerto en el que escucha el servidor (opcional, por defecto `3000`)      | `8080`                              |
| `CORS_ORIGIN` | Origenes permitidos separados por coma para la politica de CORS         | `https://app1.example.com,https://app2.example.com` |

---

## Instalacion y ejecucion

### Prerrequisitos

- Node.js 20 o superior
- Acceso a una base de datos PostgreSQL configurada con el esquema correspondiente

### Instalacion de dependencias

```bash
npm install
```

### Ejecucion en desarrollo

```bash
npm run dev
```

Inicia el servidor con `nodemon`, que recarga automaticamente ante cambios en los archivos fuente de TypeScript.

### Compilacion para produccion

```bash
npm run build
```

Transpila el codigo TypeScript a JavaScript plano en el directorio `dist/`.

### Ejecucion en produccion

```bash
npm run start
```

Ejecuta el servidor compilado desde `dist/server.js`. Este comando se utiliza en el entorno de despliegue.

### Migraciones de base de datos

```bash
npm run migrate
```

Ejecuta los scripts de migracion ubicados en `scripts/migrate.ts` para crear o actualizar las tablas necesarias en la base de datos.

---

## Autenticacion y autorizacion

### Mecanismo de autenticacion

La API implementa autenticacion mediante JSON Web Tokens (JWT). El token debe incluirse en el encabezado `Authorization` de cada solicitud protegida con el siguiente formato:

```
Authorization: Bearer <token>
```

El token es generado al momento del login y tiene una duracion de validez de 24 horas. El payload embebido en el token contiene los siguientes campos:

| Campo  | Tipo   | Descripcion                          |
|--------|--------|--------------------------------------|
| `id`   | number | Identificador unico del usuario      |
| `email`| string | Correo electronico del usuario       |
| `role` | string | Rol del usuario: `admin` o `student` |

### Middleware: `authenticateToken`

Verifica que el token JWT presente en el encabezado `Authorization` sea valido y no haya expirado. En caso de ausencia del token retorna `401`. En caso de token invalido o expirado retorna `403`. Si la verificacion es exitosa, agrega el objeto `user` al objeto `req` de Express para que los controladores posteriores puedan accederlo.

### Middleware: `authorize(roles)`

Middleware de autorizacion basado en roles. Recibe un arreglo de roles permitidos y verifica que el usuario autenticado posea uno de dichos roles. Retorna `403` si el rol del usuario no se encuentra entre los roles autorizados. Se utiliza actualmente para restringir mutaciones del modulo `settings` exclusivamente al rol `admin`.

### Roles del sistema

| Rol       | Descripcion                                                           |
|-----------|-----------------------------------------------------------------------|
| `admin`   | Acceso completo al sistema, incluyendo gestion de usuarios, laboratorios y configuracion |
| `student` | Acceso restringido a la consulta de disponibilidad, reserva propia y lectura de configuraciones |

---

## Referencia de la API

### Ruta de salud

#### GET `/health`

Verifica el estado operativo del servidor y la conectividad con la base de datos. No requiere autenticacion.

**Respuesta exitosa (200):**
```json
{
  "status": "ok",
  "time": "2026-03-25T20:00:00.000Z"
}
```

**Respuesta en caso de fallo de base de datos (500):**
```json
{
  "status": "error",
  "message": "Database connection failed"
}
```

---

### Modulo de autenticacion (`/auth`)

Las rutas de este modulo son publicas y no requieren token de acceso.

---

#### POST `/auth/login`

Autentica a un usuario en el sistema. Verifica el correo electronico, compara la contrasena con el hash almacenado, valida el estado de la cuenta y verifica que el rol sea `admin` antes de emitir un token.

**Cuerpo de la solicitud:**
```json
{
  "email": "[EMAIL_ADDRESS]",
  "password": "[PASSWORD]"
}
```

| Campo      | Tipo   | Requerido | Descripcion                         |
|------------|--------|-----------|-------------------------------------|
| `email`    | string | Si        | Correo electronico del usuario      |
| `password` | string | Si        | Contrasena en texto plano           |

**Respuesta exitosa (200):**
```json
{
  "token": "<jwt>",
  "role": "admin",
  "full_name": "Nombre del Administrador"
}
```

**Errores posibles:**

| Codigo | Mensaje                                                              | Condicion                                 |
|--------|----------------------------------------------------------------------|-------------------------------------------|
| 400    | `Email and password are required`                                    | Campos faltantes en el cuerpo             |
| 401    | `Invalid credentials`                                                | Email no encontrado o contrasena incorrecta |
| 403    | `Cuenta Inhabilitada. Contacte con el Administrador.`               | La cuenta del usuario tiene estado `inactivo` |
| 403    | `Acceso denegado. Solo administradores pueden acceder a este panel.` | El usuario no posee el rol `admin`        |
| 500    | `Internal server error`                                              | Error inesperado en el servidor           |

---

#### POST `/auth/register`

Registra un nuevo usuario en el sistema. Disponible para la configuracion inicial. El rol asignado por defecto es `student`. El correo debe pertenecer al dominio `@uce.edu.ec`.

**Cuerpo de la solicitud:**
```json
{
  "full_name": "Juan Perez",
  "email": "jperez@uce.edu.ec",
  "password": "contrasena123"
}
```

| Campo       | Tipo   | Requerido | Validacion                                   |
|-------------|--------|-----------|---------------------------------------------|
| `full_name` | string | Si        | Minimo 3 caracteres                         |
| `email`     | string | Si        | Formato email valido y dominio `@uce.edu.ec`|
| `password`  | string | Si        | Minimo 6 caracteres                         |

**Respuesta exitosa (201):**
```json
{
  "id": 1,
  "full_name": "Juan Perez",
  "email": "jperez@uce.edu.ec",
  "role": "student",
  "token": "<jwt>"
}
```

**Errores posibles:**

| Codigo | Condicion                                                    |
|--------|--------------------------------------------------------------|
| 400    | Falla en la validacion del esquema Zod                       |
| 409    | El correo electronico ya esta registrado en el sistema       |
| 500    | Error interno al insertar en la base de datos                |

---

### Modulo de laboratorios (`/labs`)

Gestiona el catalogo de laboratorios y el ciclo de vida completo de las reservas.

---

#### GET `/labs`

Retorna el listado completo de laboratorios registrados en el sistema. Esta ruta es publica y no requiere autenticacion.

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre": "Laboratorio de Redes",
    "ubicacion": "Bloque A, Piso 2",
    "capacidad": 30,
    "estado": "disponible"
  }
]
```

---

#### POST `/labs`

Crea un nuevo laboratorio en el sistema. Requiere autenticacion.

**Cuerpo de la solicitud:**
```json
{
  "nombre": "Laboratorio de Sistemas",
  "ubicacion": "Bloque B, Piso 1",
  "capacidad": 25,
  "estado": "disponible"
}
```

| Campo       | Tipo   | Validacion              |
|-------------|--------|-------------------------|
| `nombre`    | string | Minimo 3 caracteres     |
| `ubicacion` | string | Minimo 3 caracteres     |
| `capacidad` | number | Minimo 1               |
| `estado`    | string | Minimo 3 caracteres     |

**Respuesta exitosa (201):** Retorna el objeto del laboratorio creado.

---

#### PUT `/labs/:id`

Actualiza los datos de un laboratorio existente. Requiere autenticacion. Acepta el mismo esquema de validacion que el endpoint de creacion.

**Respuesta exitosa (200):** Retorna el objeto del laboratorio actualizado.

**Error (404):** `Lab not found` si el identificador no corresponde a ningun registro.

---

#### DELETE `/labs/:id`

Elimina un laboratorio del sistema. Requiere autenticacion. Si el laboratorio posee reservas existentes asociadas, la operacion es rechazada por la base de datos con un error de integridad referencial.

**Respuesta exitosa (200):**
```json
{ "success": true }
```

**Error (404):** `Lab not found`.

**Error (500):** `No se puede eliminar un laboratorio con reservas existentes. Desactivelo.`

---

#### GET `/labs/disponibilidad`

Consulta la disponibilidad horaria de un laboratorio para una fecha determinada. Requiere autenticacion.

**Parametros de consulta (query):**

| Parametro | Tipo   | Requerido | Descripcion                      |
|-----------|--------|-----------|----------------------------------|
| `fecha`   | string | Si        | Fecha en formato `YYYY-MM-DD`    |
| `lab_id`  | number | Si        | Identificador del laboratorio    |

**Respuesta exitosa (200):**
```json
[
  { "hora": 7, "estado": "libre" },
  { "hora": 8, "estado": "ocupado" },
  { "hora": 9, "estado": "libre" }
]
```

Los horarios validos van de las 07:00 a las 20:00 horas. El campo `estado` puede ser `libre` u `ocupado`.

---

#### POST `/labs/reservar`

Crea una o varias reservas para un laboratorio en una fecha y conjunto de horas determinados. Cada hora seleccionada genera un registro independiente en la base de datos. La insercion se realiza dentro de una transaccion atomica: si alguna hora falla por conflicto, la transaccion completa es revertida. Requiere autenticacion.

**Cuerpo de la solicitud:**
```json
{
  "lab_id": 1,
  "fecha": "2026-04-10",
  "horas": [8, 9, 10],
  "materia": "Redes de Computadores"
}
```

| Campo     | Tipo            | Validacion                                            |
|-----------|-----------------|-------------------------------------------------------|
| `lab_id`  | number          | Requerido                                             |
| `fecha`   | string          | Formato `YYYY-MM-DD` (expresion regular)              |
| `horas`   | number[]        | Minimo un elemento; cada hora debe estar entre 7 y 20 |
| `materia` | string          | Minimo 3 caracteres                                   |

**Respuesta exitosa (201):** Arreglo de reservas creadas.

**Error (409):** `One or more time slots are already occupied.` cuando existe conflicto de unicidad en la base de datos (codigo `23505`).

---

#### GET `/labs/mis-reservas`

Retorna todas las reservas del usuario autenticado actualmente. Calcula dinamicamente el campo `estado` de cada reserva segun la zona horaria de Ecuador (`America/Guayaquil`): el valor sera `active` si la reserva es futura o esta en curso, y `expired` si ya finalizó. Requiere autenticacion.

**Respuesta exitosa (200):** Arreglo de reservas con el campo `estado` calculado.

---

#### GET `/labs/todas-reservas`

Retorna la totalidad de las reservas del sistema, incluyendo informacion del usuario solicitante y del laboratorio. Incluye calculo de `estado` identico al endpoint de reservas personales. Requiere autenticacion. Destinado al uso exclusivo del panel de administracion.

---

#### DELETE `/labs/reservas/:id`

Cancela y elimina permanentemente una reserva especifica. La eliminacion solo procede si el identificador de usuario en el token JWT coincide con el `user_id` almacenado en la reserva. Requiere autenticacion.

**Respuesta exitosa (200):**
```json
{ "message": "Reservation cancelled successfully" }
```

**Error (404):** `Reservation not found or unauthorized`.

---

#### PATCH `/labs/reservas/:id/reagendar`

Modifica la fecha y la hora de inicio de una reserva existente. Incluye validaciones temporales basadas en la zona horaria de Ecuador para impedir reagendar hacia fechas pasadas u horas ya transcurridas del dia actual. Requiere autenticacion.

**Cuerpo de la solicitud:**
```json
{
  "fecha": "2026-04-15",
  "hora_inicio": 10
}
```

| Campo        | Tipo   | Requerido | Descripcion                              |
|--------------|--------|-----------|------------------------------------------|
| `fecha`      | string | Si        | Nueva fecha en formato `YYYY-MM-DD`      |
| `hora_inicio`| number | Si        | Nueva hora de inicio (entre 7 y 20)      |

**Respuesta exitosa (200):**
```json
{
  "message": "Reservation rescheduled successfully",
  "reservation": { }
}
```

**Errores posibles:**

| Codigo | Condicion                                                               |
|--------|-------------------------------------------------------------------------|
| 400    | `No puedes reagendar una reserva hacia un dia pasado.`                  |
| 400    | `No puedes reagendar para una hora que ya finalizo o esta en curso.`    |
| 404    | Reserva no encontrada                                                   |
| 409    | `El horario solicitado ya se encuentra ocupado.` (conflicto de unicidad)|

---

### Modulo de usuarios (`/users`)

Todas las rutas de este modulo requieren autenticacion mediante token JWT valido.

---

#### GET `/users`

Retorna el listado completo de todos los usuarios registrados en el sistema.

**Respuesta exitosa (200):** Arreglo de objetos de usuario. El campo `password_hash` no se expone en la respuesta.

---

#### GET `/users/:id`

Retorna el perfil detallado de un usuario especifico identificado por su `id`.

**Respuesta exitosa (200):** Objeto de usuario.

**Error (404):** `Usuario no encontrado`.

---

#### POST `/users`

Crea un nuevo usuario en el sistema desde el panel de administracion. Permite asignar un rol especifico en el momento de la creacion.

**Cuerpo de la solicitud:**
```json
{
  "full_name": "Maria Lopez",
  "email": "mlopez@uce.edu.ec",
  "password": "clave_segura",
  "role": "student",
  "estado": "activo"
}
```

| Campo       | Tipo   | Validacion                         |
|-------------|--------|------------------------------------|
| `full_name` | string | Minimo 3 caracteres                |
| `email`     | string | Formato email valido               |
| `password`  | string | Minimo 6 caracteres                |
| `role`      | string | Valor enumerado: `admin`, `student`|
| `estado`    | string | Minimo 3 caracteres                |

**Respuesta exitosa (201):** Objeto del usuario creado.

**Error (409):** `El correo electronico ya esta registrado en el sistema.`

---

#### PUT `/users/:id`

Actualiza los datos de perfil de un usuario existente. No modifica la contrasena (para ello existe un endpoint dedicado). Acepta el mismo esquema de validacion que la creacion, excluyendo el campo `password`.

**Respuesta exitosa (200):** Objeto del usuario actualizado.

**Error (409):** `El correo electronico ya esta siendo usado por otra persona.`

---

#### PUT `/users/:id/password`

Fuerza el restablecimiento de la contrasena de un usuario especifico desde el panel de administracion. La nueva contrasena es hasheada con bcrypt antes de ser almacenada.

**Cuerpo de la solicitud:**
```json
{
  "password": "nueva_contrasena_segura"
}
```

| Campo      | Tipo   | Validacion            |
|------------|--------|-----------------------|
| `password` | string | Minimo 6 caracteres   |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Contrasena actualizada exitosamente"
}
```

---

### Modulo de configuracion del sistema (`/settings`)

Todas las rutas de este modulo requieren autenticacion JWT. Las operaciones de escritura estan restringidas al rol `admin`.

---

#### GET `/settings`

Retorna todas las configuraciones globales del sistema ordenadas alfabeticamente por clave. Accesible por cualquier usuario autenticado, incluyendo estudiantes (necesitan leer limites y mensajes de configuracion).

**Respuesta exitosa (200):**
```json
[
  {
    "key": "max_reservas_por_dia",
    "value": 3,
    "description": "Numero maximo de reservas que un estudiante puede realizar por dia"
  }
]
```

---

#### PUT `/settings/:key`

Actualiza el valor de una configuracion del sistema identificada por su clave. Solo los usuarios con rol `admin` pueden ejecutar esta operacion. El sistema verifica que la clave exista previamente para evitar la insercion de configuraciones no definidas.

**Cuerpo de la solicitud:**
```json
{
  "value": 5
}
```

El campo `value` acepta cualquier tipo de dato JSON (numero, cadena, booleano, objeto).

**Respuesta exitosa (200):** Objeto de configuracion actualizado.

**Error (404):** `La configuracion '<key>' no existe en la matriz del sistema.`

---

#### POST `/settings/purge-history`

Ejecuta una purga del historial de reservas de la base de datos segun los estados de reserva especificados. Solo disponible para el rol `admin`. Permite seleccionar registros finalizados (cuya fecha y hora ya ocurrieron) y/o activos (cuya fecha y hora son presentes o futuras).

**Cuerpo de la solicitud:**
```json
{
  "targetStatuses": ["finalizada", "activa"]
}
```

| Valor en `targetStatuses` | Registros eliminados                                                      |
|---------------------------|---------------------------------------------------------------------------|
| `finalizada`              | Reservas cuya fecha es anterior a la fecha actual, o cuya hora ya transcurrio en el dia actual |
| `activa`                  | Reservas cuya fecha es futura, o cuya hora aun no ha comenzado en el dia actual |

**Respuesta exitosa (200):**
```json
{
  "message": "Purga del historial ejecutada exitosamente.",
  "deleted_rows": 42
}
```

**Error (400):** `Debe especificar al menos un estado para purgar.`

---

## Modelos de datos

### Usuario (`users`)

| Campo           | Tipo   | Descripcion                                    |
|-----------------|--------|------------------------------------------------|
| `id`            | number | Identificador primario autoincremental         |
| `full_name`     | string | Nombre completo del usuario                    |
| `email`         | string | Correo electronico unico (usado como login)    |
| `password_hash` | string | Hash bcrypt de la contrasena del usuario       |
| `role`          | string | Rol del usuario: `admin` o `student`           |
| `estado`        | string | Estado de la cuenta: `activo` o `inactivo`     |

### Laboratorio (`laboratorios`)

| Campo       | Tipo   | Descripcion                                                       |
|-------------|--------|-------------------------------------------------------------------|
| `id`        | number | Identificador primario autoincremental                            |
| `nombre`    | string | Nombre del laboratorio                                            |
| `ubicacion` | string | Ubicacion fisica dentro del campus                               |
| `capacidad` | number | Numero maximo de personas que puede albergar                     |
| `estado`    | string | Estado operativo: `disponible`, `mantenimiento`, `inhabilitado`  |

### Reserva (`reservas`)

| Campo        | Tipo   | Descripcion                                                        |
|--------------|--------|--------------------------------------------------------------------|
| `id`         | number | Identificador primario autoincremental                             |
| `lab_id`     | number | Referencia al laboratorio reservado (clave foranea)                |
| `user_id`    | number | Referencia al usuario solicitante (clave foranea)                  |
| `fecha`      | string | Fecha de la reserva en formato `YYYY-MM-DD`                        |
| `hora_inicio`| number | Hora de inicio en formato de 24 horas (entre 7 y 20)               |
| `materia`    | string | Materia o actividad para la que se solicita el laboratorio         |
| `creado_en`  | Date   | Marca de tiempo de la creacion del registro                        |

### Configuracion del sistema (`system_settings`)

| Campo         | Tipo   | Descripcion                                              |
|---------------|--------|----------------------------------------------------------|
| `key`         | string | Identificador unico de la configuracion                  |
| `value`       | JSON   | Valor actual de la configuracion en formato JSON         |
| `description` | string | Descripcion del proposito de la configuracion            |

---

## Logica de negocio relevante

### Restriccion de concurrencia en reservas

Las reservas se insertan mediante una transaccion atomica de base de datos. Si alguna de las horas solicitadas provoca una violacion de la restriccion de unicidad (codigo de error PostgreSQL `23505`), la transaccion completa es revertida mediante `ROLLBACK`, garantizando la consistencia del sistema.

### Calculo de estado de reservas basado en zona horaria

El calculo del campo dinamico `estado` (`active` / `expired`) para las reservas se realiza exclusivamente con la zona horaria `America/Guayaquil`. El servidor convierte la hora actual mediante `toLocaleString` con la opcion de zona horaria correspondiente para evitar inconsistencias derivadas del huso horario del servidor de despliegue.

### Validacion temporal en reagendamiento

Al reagendar una reserva, el sistema valida que:
1. La nueva fecha sea igual o posterior a la fecha actual en hora de Ecuador.
2. Si la nueva fecha es el dia actual, la hora de inicio sea estrictamente mayor a la hora actual (no se permite reagendar para una hora que ya inicio o esta en curso).

### Bloqueo de cuentas inactivas

En el proceso de login, una vez verificada la identidad del usuario, se evalua el campo `estado`. Si su valor es `inactivo`, la solicitud es rechazada con un error `403` antes de emitir cualquier token, independientemente de que las credenciales sean correctas.

### Restriccion de eliminacion de laboratorios con reservas

La eliminacion fisica de un laboratorio que posea reservas asociadas es rechazada en la capa de base de datos mediante integridad referencial. El error es capturado y transformado en un mensaje descriptivo orientado al usuario administrador, indicando que debe desactivar el laboratorio en lugar de eliminarlo.

---

## Codigos de error estandarizados

| Codigo HTTP | Significado general en esta API                                         |
|-------------|-------------------------------------------------------------------------|
| 400         | Solicitud invalida: parametros faltantes o falla de validacion Zod      |
| 401         | Token JWT ausente o usuario no autenticado                              |
| 403         | Token invalido, expirado, o rol insuficiente para la operacion solicitada |
| 404         | Recurso no encontrado (usuario, laboratorio, reserva o configuracion)   |
| 409         | Conflicto de datos: correo duplicado o turno de reserva ya ocupado      |
| 500         | Error interno del servidor o de la base de datos                        |

---

## Politica de CORS

El servidor implementa una politica de CORS estricta configurable mediante la variable de entorno `CORS_ORIGIN`. El mecanismo de evaluacion funciona de la siguiente manera:

1. Las solicitudes sin encabezado `Origin` (por ejemplo, peticiones desde herramientas como `curl` o clientes moviles) son permitidas de forma predeterminada.
2. Los origenes declarados en `CORS_ORIGIN` (separados por coma) son comparados de forma exacta contra el origen de la solicitud.
3. Cualquier origen cuyo dominio termine en `.vercel.app` es admitido automaticamente para facilitar el trabajo con previsualizaciones de despliegue de Vercel.
4. Todo origen que no cumpla ninguna de las condiciones anteriores recibe un rechazo con el error `Not allowed by CORS`.
5. La opcion `credentials: true` esta habilitada, permitiendo el envio de encabezados de autorizacion y cookies desde los clientes.

En caso de que la variable `CORS_ORIGIN` no este definida, el servidor utiliza como fallback una lista de origenes locales de desarrollo:
```
http://localhost:5173
http://localhost:5174
http://localhost:3000
http://localhost:3001
```
