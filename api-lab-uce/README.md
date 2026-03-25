# Reservas Lab UCE API

Sistema de gestión de reservas para laboratorios universitarios, construido con Express.js, TypeScript y PostgreSQL (Neon).

## Requisitos

- Node.js (v18+)
- PostgreSQL (Neon.tech recomendado)

## Configuración

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno en `.env` (ver `.env.example` o crear uno basado en el siguiente formato):
   ```env
   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
   JWT_SECRET="tu_secreto_seguro"
   PORT=3000
   ```

## Scripts

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Compila el proyecto a JavaScript en la carpeta `dist`.
- `npm run start`: Inicia el servidor en producción.
- `npm run migrate`: Ejecuta las migraciones de base de datos.
