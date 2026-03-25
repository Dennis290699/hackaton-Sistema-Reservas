import { pool } from '../src/db';
import bcrypt from 'bcrypt';

async function seed() {
    try {
        const client = await pool.connect();
        console.log('Seeding database...');

        // 1. Seed Laboratories
        const labs = [
            { nombre: 'Laboratorio 1', capacidad: 20 },
            { nombre: 'Laboratorio 2', capacidad: 20 },
            { nombre: 'Laboratorio 3', capacidad: 20 },
            { nombre: 'Laboratorio 4', capacidad: 20 },
            { nombre: 'Laboratorio 5', capacidad: 20 },
            { nombre: 'Laboratorio 6', capacidad: 20 },
            { nombre: 'Laboratorio de Redes y Comunicaciones', capacidad: 5 }, // 5 racks
        ];

        for (const lab of labs) {
            // Check if exists to avoid duplicates
            const exists = await client.query('SELECT id FROM laboratorios WHERE nombre = $1', [lab.nombre]);
            if (exists.rowCount === 0) {
                await client.query('INSERT INTO laboratorios (nombre, capacidad) VALUES ($1, $2)', [lab.nombre, lab.capacidad]);
                console.log(`Inserted: ${lab.nombre}`);
            } else {
                console.log(`Skipped (already exists): ${lab.nombre}`);
            }
        }

        // 2. Seed Default Admin
        const adminUsername = 'admin';
        const adminPassword = 'password123';
        const adminExists = await client.query('SELECT id FROM administradores WHERE username = $1', [adminUsername]);

        if (adminExists.rowCount === 0) {
            const hash = await bcrypt.hash(adminPassword, 10);
            await client.query('INSERT INTO administradores (username, password_hash) VALUES ($1, $2)', [adminUsername, hash]);
            console.log(`Inserted default admin: ${adminUsername}`);
        } else {
            console.log(`Skipped (already exists): Default admin`);
        }

        client.release();
        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
