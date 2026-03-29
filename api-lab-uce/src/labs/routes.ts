import { Router } from 'express';
import { getAvailability, createBooking, listLabs, getUserReservations, cancelReservation, adminCancelReservation, getAllReservations, rescheduleReservation, addLab, editLab, removeLab } from './controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Lab management routes
router.get('/', listLabs);
router.post('/', authenticateToken, addLab);
router.put('/:id', authenticateToken, editLab);
router.delete('/:id', authenticateToken, removeLab);

// Lab availability & booking
router.get('/disponibilidad', authenticateToken, getAvailability);
router.post('/reservar', authenticateToken, createBooking);

router.get('/mis-reservas', authenticateToken, getUserReservations);
router.get('/todas-reservas', authenticateToken, getAllReservations);
router.delete('/reservas/:id', authenticateToken, cancelReservation);
router.delete('/reservas/:id/admin', authenticateToken, adminCancelReservation);
router.patch('/reservas/:id/reagendar', authenticateToken, rescheduleReservation);

export default router;
