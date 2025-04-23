import express from 'express';
import * as rbacController from './rbac.controller';
import { authenticateToken, checkRole } from '../../middleware/auth.middleware';
// import { validateRequest } from '../../middleware/validation.middleware';

const router = express.Router();

// Rutas solo para Admin
router.use(authenticateToken, checkRole(['admin']));

router.get('/roles', rbacController.fetchRoles);
router.get('/permisos', rbacController.fetchPermisos);
router.get('/roles/:roleId/permisos', rbacController.fetchRolePermissions);

// --- Rutas Admin para CRUD de RBAC (Ejemplo) ---
// router.post('/roles', validateRequest(createRoleSchema), rbacController.createRole);
// router.post('/roles/:roleId/permisos/:permisoId', rbacController.assignPermissionToRole);
// ...etc

export default router;