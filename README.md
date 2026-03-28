# Sistema de Gestión y Reserva de Laboratorios

## Enlaces a las Demos (Desplegadas en CubePath)

  * **Panel de Usuarios (Estudiantes):** [Acceder a la Demo](http://hackatonsistemareservasfrontends-fronten-7491cc-45-90-237-232.traefik.me)
  * **Panel Administrativo:** [Acceder a la Demo](http://hackatonsistemareservasfrontends-fronten-260fce-45-90-237-232.traefik.me)

> **⚠️ Instrucciones Importantes para Pruebas:**
> Para evaluar la funcionalidad completa del Panel de Usuarios, **es obligatorio registrar una cuenta nueva simulando el dominio institucional (`@uce.edu.ec`)** (por ejemplo: `evaluador@uce.edu.ec`). El sistema cuenta con validación estricta de correo; si se intenta usar un dominio distinto, el registro fallará y no será posible crear ni visualizar las reservas. El Panel Administrativo es de acceso restringido y no admite auto-registro.

-----

## 1\. Contexto y Problema a Resolver

En la Universidad Central del Ecuador (UCE), lugar donde realizo mi formación academica profesional, la gestión de reservas de los laboratorios se realiza tradicionalmente de forma manual, utilizando registros en papel o en hojas de cálculo de Excel. Este enfoque requiere que el estudiante se acerque de manera presencial a las instalaciones para verificar la disponibilidad y asegurar su reserva, lo cual genera ineficiencias, cruce de horarios y una pérdida significativa de tiempo tanto para el alumnado como para el personal administrativo.

## 2\. La Solución

Se desarrolló un sistema web integral de reservas compuesto por dos interfaces independientes (Administrador y Estudiante) conectadas a una API centralizada.

El sistema implementa una validación estricta de dominio, requiriendo que los estudiantes utilicen exclusivamente el correo institucional (`@uce.edu.ec`) para su registro. Para evitar conflictos de concurrencia en los laboratorios, el panel de usuarios cuenta con un refresco en segundo plano de 15 segundos, garantizando que la disponibilidad de los espacios se visualice en tiempo real. Adicionalmente, el sistema permite a la administración emitir comunicados y eventos que se reflejan de forma inmediata en el panel estudiantil.

## 3\. Arquitectura e Infraestructura (Uso de CubePath)

El despliegue del proyecto se diseñó bajo una arquitectura distribuida para garantizar la estabilidad y evitar la saturación de los procesos de compilación del frontend sobre el backend. Se utilizaron los servicios de **CubePath** levantando dos servidores virtuales independientes gestionados con **Dokploy**:

  * **Servidor 1 (Backend):** Alojamiento exclusivo y aislado para la API de Express, garantizando la disponibilidad de los endpoints y la conexión a la base de datos sin interferencias de consumo de memoria.
  * **Servidor 2 (Frontends):** Servidor dedicado al despliegue de las aplicaciones cliente (React y Next.js), manejando el enrutamiento y la carga de la interfaz de usuario.

## 4\. Tecnologías Utilizadas

### Frontend

  * **Panel de Usuarios (React):** Interfaz para estudiantes. Maneja el registro institucional, visualización de laboratorios y creación de reservas en tiempo real.
  * **Panel Administrativo (Next.js):** Interfaz de gestión con credenciales independientes. Permite la administración de laboratorios, usuarios, revisión de reservas y publicación de avisos.

### Backend & Base de Datos

  * **API REST (Node.js + Express):** Orquesta la lógica de negocio, la separación de roles (Estudiante/Administrador) y la validación de dominios de correo.
  * **Base de Datos (PostgreSQL en NeonTech):** Almacenamiento relacional en la nube para garantizar la integridad de las reservas y los datos de los usuarios.

### DevOps & Hosting

  * **CubePath:** Proveedor de infraestructura (VPS).
  * **Dokploy:** Plataforma PaaS autoalojada utilizada en los servidores de CubePath para el despliegue continuo (CI/CD) mediante contenedores Docker.

-----

## 5\. Capturas de Pantalla del Sistema

### Panel de Usuarios (Estudiantes)

> *Vista principal del estudiante: Gestión de reservas y avisos institucionales.*

### Panel Administrativo

> *Vista del administrador: Control total sobre laboratorios, usuarios y horarios.*