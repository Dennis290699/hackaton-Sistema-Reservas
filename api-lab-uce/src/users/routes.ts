import { Router } from 'express';
import { listAllUsers, addUser, editUser, changeUserPassword, getSingleUser } from './controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect all user management routes with standard token auth
// Role checks could be added here if needed, but the current token handles admin
router.get('/', authenticateToken, listAllUsers);
router.get('/:id', authenticateToken, getSingleUser);
router.post('/', authenticateToken, addUser);
router.put('/:id', authenticateToken, editUser);
router.put('/:id/password', authenticateToken, changeUserPassword);

export default router;
