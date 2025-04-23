import express from 'express';
import * as empController from './emprendimientos.controller';
import { authenticateToken, checkRole } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import {
    createEmprendimientoSchema,
    updateEmprendimientoSchema,
    getEmprendimientoByIdSchema,
    updateStatusSchema,
    getEmprendimientosSchema
 } from './emprendimientos.validation';
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../utils/jwt'; // Necesitamos verifyToken aquí

const router = express.Router();

// Middleware para adjuntar usuario si existe token (para rutas públicas/privadas)
const attachUserIfPresent = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (token) {
        const payload = verifyToken(token);
        if (payload) {
            req.user = payload; // Adjuntar si es válido
        }
    }
    next();
};

// --- Rutas Públicas / Semi-Públicas ---
// GET all (público, pero filtra por 'aprobado' si no es admin)
router.get('/', attachUserIfPresent, validateRequest(getEmprendimientosSchema), empController.getAllEmprendimientos);
// GET by ID (público si está aprobado, dueño/admin pueden ver otros estados)
router.get('/:id', attachUserIfPresent, validateRequest(getEmprendimientoByIdSchema), empController.getEmprendimientoById);


// --- Rutas para Emprendedores ---
// Aplicar autenticación y rol 'emprendedor' (o 'admin')
router.post('/', authenticateToken, checkRole(['emprendedor', 'admin']), validateRequest(createEmprendimientoSchema), empController.createEmprendimiento);
router.get('/my/list', authenticateToken, checkRole(['emprendedor', 'admin']), empController.getMyEmprendimientos); // Ruta específica para 'mis emprendimientos'

// --- Rutas para Dueños y Admin ---
// PUT y DELETE requieren autenticación y ser dueño o admin
router.put('/:id', authenticateToken, checkRole(['emprendedor', 'admin']), validateRequest(updateEmprendimientoSchema), empController.updateEmprendimiento);
router.delete('/:id', authenticateToken, checkRole(['emprendedor', 'admin']), validateRequest(getEmprendimientoByIdSchema), empController.deleteEmprendimiento);


// --- Rutas solo para Admin ---
// Endpoint específico para cambiar estado
router.patch('/:id/status', authenticateToken, checkRole(['admin']), validateRequest(updateStatusSchema), empController.updateStatus); // Usar PATCH para actualización parcial de estado
// Endpoint para ver pendientes
router.get('/admin/pending', authenticateToken, checkRole(['admin']), empController.getPending);


export default router;