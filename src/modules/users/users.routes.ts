import express from 'express';
import * as userController from './users.controller';
import { authenticateToken, checkRole } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import multer from 'multer';
import { uploadMyProfilePhoto, uploadUserProfilePhoto } from '../../middleware/storage.middleware';
import {
    updateMeSchema,
    updateUserByAdminSchema,
    manageUserRoleSchema,
    getUserByIdSchema
} from './users.validation';

const router = express.Router();

// Configuración de multer para almacenamiento en memoria
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB límite
});

// Todas las rutas de este módulo requieren autenticación
router.use(authenticateToken);

// Rutas para el usuario sobre sí mismo
router.get('/me', userController.getMe);
router.put('/me', validateRequest(updateMeSchema), userController.updateMe);

// Ruta para subir foto de perfil mediante multipart/form-data
router.post('/me/profile-photo', upload.single('photo'), uploadMyProfilePhoto);

// Ruta para eliminar la foto de perfil del usuario actual
router.delete('/me/profile-photo', userController.deleteMyProfilePhoto);

// --- Rutas solo para Administradores ---
// Aplicar middleware de rol admin a las rutas siguientes
router.use(checkRole(['admin']));

router.get('/', userController.getAllUsers); // GET /api/users?page=1&limit=10&email=...&active=true
router.get('/:id', validateRequest(getUserByIdSchema), userController.getUserById);
router.put('/:id', validateRequest(updateUserByAdminSchema), userController.updateUser);
router.delete('/:id', validateRequest(getUserByIdSchema), userController.deleteUser);

// Subir foto de perfil para un usuario específico (admin)
router.post('/:id/profile-photo', validateRequest(getUserByIdSchema), upload.single('photo'), uploadUserProfilePhoto);

// Eliminar foto de perfil de un usuario específico (admin)
router.delete('/:id/profile-photo', validateRequest(getUserByIdSchema), userController.deleteUserProfilePhoto);

// Gestión de roles
router.post('/:id/roles/:roleId', validateRequest(manageUserRoleSchema), userController.assignRole);
router.delete('/:id/roles/:roleId', validateRequest(manageUserRoleSchema), userController.removeRole);

export default router;