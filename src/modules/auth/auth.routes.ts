import express from 'express';
import * as authController from './auth.controller';
import { validateRequest } from '../../middleware/validation.middleware';
import {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    requestPasswordResetSchema,
    resetPasswordSchema,
    resendVerificationSchema
} from './auth.validation';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), authController.registerUser);
router.post('/login', validateRequest(loginSchema), authController.loginUser);
router.post('/logout', authenticateToken, authController.logoutUser); // Requiere estar logueado

// Verificación de Email
router.get('/verify-email/:token', validateRequest(verifyEmailSchema), authController.handleVerifyEmail);
// Reenviar Email de Verificación
router.post('/resend-verification', validateRequest(resendVerificationSchema), authController.resendVerificationEmail);

// Reseteo de Contraseña
router.post('/request-password-reset', validateRequest(requestPasswordResetSchema), authController.handleRequestPasswordReset);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.handleResetPassword);

export default router;