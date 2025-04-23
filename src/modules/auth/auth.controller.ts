import { Request, Response } from 'express';
import * as authService from './auth.service';
import { asyncHandler } from '../../utils/helpers';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const userData = req.body;
    const result = await authService.register(userData, req); // Pasar req para logging
    res.status(201).json(result);
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password, req); // Pasar req
    res.status(200).json(result);
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    // Asegurarse de que req.user exista (de authenticateToken)
    const userId = req.user?.userId;
    if (!userId) {
         // Esto no debería ocurrir si authenticateToken se usa correctamente
        return res.status(401).json({ message: "Authentication required" });
    }
    const result = await authService.logout(userId, req); // Pasar req
    res.status(200).json(result);
});

export const handleVerifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const result = await authService.verifyEmail(token, req); // Pasar req
    // Considerar redireccionar al frontend o mostrar una página de éxito
    res.status(200).json(result);
});

export const handleRequestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email, req); // Pasar req
    res.status(200).json(result);
});

export const handleResetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword, req); // Pasar req
    res.status(200).json(result);
});

// Nuevo endpoint para reenviar email de verificación
export const resendVerificationEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.resendVerificationEmail(email, req);
    res.status(200).json(result);
});