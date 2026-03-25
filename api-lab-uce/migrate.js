const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const migrate = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                key VARCHAR(50) PRIMARY KEY,
                value JSONB NOT NULL,
                description TEXT
            );
        `);
        console.log("✔ Tabla system_settings creada.");

        await pool.query(`
            INSERT INTO system_settings (key, value, description)
            VALUES 
            ('booking_rules', '{"max_days_advance": 14, "max_hours_week": 10}', 'Parametros numericos para reservas'),
            ('operational_policies', '{"opening_time": "07:00", "closing_time": "21:00", "emergency_lockdown": false}', 'Regimen de apertura y bloqueo maestro'),
            ('communication_banners', '{"global_message": "", "is_active": false}', 'Mensaje anclado para los estudiantes')
            ON CONFLICT (key) DO NOTHING;
        `);
        console.log("✔ Datos default insertados.");
        
    } catch (error) {
        console.error("Error ejecutando migracion:", error);
    } finally {
        pool.end();
    }
};

migrate();
