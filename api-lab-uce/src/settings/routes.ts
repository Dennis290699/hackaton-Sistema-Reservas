import { Router } from 'express';
import { getSettings, updateSetting, purgeHistory } from './controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();

// Protect ALL routes with JWT Authentication
router.use(authenticateToken);

// GET is accessible by any authenticated user (Students need to read the limits/banners)
router.get('/', getSettings);

// Mutations are strictly for Admins
router.put('/:key', authorize(['admin']), updateSetting);
router.post('/purge-history', authorize(['admin']), purgeHistory);

export default router;
