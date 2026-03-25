-- TABLAS INDEPENDIENTES PERO RELACIONADAS
CREATE TABLE IF NOT EXISTS administradores (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS laboratorios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL, -- Ej: "Lab Redes"
    capacidad INTEGER DEFAULT 30
);

CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    lab_id INTEGER REFERENCES laboratorios(id) ON DELETE CASCADE,
    admin_id INTEGER REFERENCES administradores(id),
    fecha DATE NOT NULL,
    hora_inicio INTEGER NOT NULL, -- Usaremos enteros 7, 8, 9... 19
    materia VARCHAR(100) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Regla de oro: No dos reservas en mismo lab/fecha/hora
    UNIQUE(lab_id, fecha, hora_inicio)
);
