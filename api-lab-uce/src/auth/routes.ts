import { Router } from 'express';
import { login, register } from './controller';

const router = Router();

router.post('/login', login);
router.post('/register', register); // Optional, for initial setup

export default router;
