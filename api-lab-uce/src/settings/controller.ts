import { Request, Response } from 'express';
import { pool } from '../db';
import { z } from 'zod';

const updateSettingSchema = z.object({
  value: z.any()
});

export const getSettings = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT key, value, description FROM system_settings ORDER BY key ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error in getSettings:', error);
        res.status(500).json({ error: 'Error al extraer configuraciones globales del sistema.' });
    }
};

export const updateSetting = async (req: Request, res: Response) => {
    try {
        const { key } = req.params;
        const parseResult = updateSettingSchema.safeParse(req.body);
        
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Payload structure is invalid.', details: parseResult.error.format() });
        }
        
        const { value } = parseResult.data;
        
        // Ensure the setting exists before updating to avoid random key injections
        const check = await pool.query('SELECT key FROM system_settings WHERE key = $1', [key]);
        if (check.rowCount === 0) {
            return res.status(404).json({ error: `La configuración '${key}' no existe en la matriz del sistema.` });
        }

        const result = await pool.query(
            'UPDATE system_settings SET value = $1 WHERE key = $2 RETURNING *',
            [JSON.stringify(value), key]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error in updateSetting:', error);
        res.status(500).json({ error: 'Error crítico al sobreescribir configuraciones globales.' });
    }
};

export const purgeHistory = async (req: Request, res: Response) => {
    try {
        const { targetStatuses } = req.body;
        
        if (!Array.isArray(targetStatuses) || targetStatuses.length === 0) {
            return res.status(400).json({ error: 'Debe especificar al menos un estado para purgar.' });
        }

        const deleteConditions = [];

        if (targetStatuses.includes('finalizada')) {
            deleteConditions.push(`(fecha < CURRENT_DATE OR (fecha = CURRENT_DATE AND hora_inicio < EXTRACT(HOUR FROM CURRENT_TIME)))`);
        }
        if (targetStatuses.includes('activa')) {
            deleteConditions.push(`(fecha > CURRENT_DATE OR (fecha = CURRENT_DATE AND hora_inicio >= EXTRACT(HOUR FROM CURRENT_TIME)))`);
        }

        if (deleteConditions.length === 0) {
           // Si solo pasaron 'cancelada' (que son hard-deleted), no hacemos nada
           return res.json({ message: 'No hay registros físicos que coincidan con la purga.', deleted_rows: 0 });
        }

        const query = `
            DELETE FROM reservas
            WHERE ${deleteConditions.join(' OR ')}
        `;
        
        const result = await pool.query(query);
        
        res.json({
            message: 'Purga del historial ejecutada exitosamente.',
            deleted_rows: result.rowCount
        });
    } catch (error) {
        console.error('Error in purgeHistory:', error);
        res.status(500).json({ error: 'Fallo al ejecutar la Directiva de Limpieza profunda.' });
    }
};
