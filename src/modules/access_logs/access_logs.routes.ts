import express from 'express';
import * as logController from './access_logs.controller';
import { authenticateToken, checkRole } from '../../middleware/auth.middleware';

const router = express.Router();

// Todas las rutas de logs requieren ser admin
router.use(authenticateToken, checkRole(['admin']));

router.get('/', logController.fetchLogs);

export default router;