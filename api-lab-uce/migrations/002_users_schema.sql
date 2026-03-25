-- Create ENUM for roles if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create generic users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing admins to users (if any)
INSERT INTO users (full_name, email, password_hash, role)
SELECT username, username || '@admin.local', password_hash, 'admin'
FROM administradores
ON CONFLICT (email) DO NOTHING;

-- Update reservas to reference users instead of administradores
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
