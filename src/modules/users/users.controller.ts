import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/helpers';
import * as userService from './users.service';

// Obtener datos del usuario logueado
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    const user = await userService.getCurrentUser(userId);
    res.status(200).json(user);
});

// Actualizar datos del usuario logueado
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    const updatedUser = await userService.updateCurrentUser(userId, req.body);
    res.status(200).json(updatedUser);
});

// Eliminar foto de perfil del usuario logueado
export const deleteMyProfilePhoto = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    const updatedUser = await userService.removeProfilePhoto(userId);
    res.status(200).json(updatedUser);
});

// --- Controladores Admin ---

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Extraer filtros de los query params
    const filters: Record<string, any> = {};
    if (req.query.email) filters.email = req.query.email as string;
    if (req.query.active !== undefined) {
        filters.active = req.query.active === 'true';
    }
    
    const result = await userService.getAllUsers(page, limit, filters);
    res.status(200).json(result);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.status(200).json(user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.user?.userId;
    if (!adminId) {
        return res.status(401).json({ message: 'Admin user not authenticated' });
    }
    const updatedUser = await userService.updateUserById(adminId, id, req.body, req);
    res.status(200).json(updatedUser);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.user?.userId;
    if (!adminId) {
        return res.status(401).json({ message: 'Admin user not authenticated' });
    }
    const result = await userService.deleteUserById(adminId, id, req);
    res.status(200).json(result);
});

// Eliminar foto de perfil de un usuario (admin)
export const deleteUserProfilePhoto = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.user?.userId;
    if (!adminId) {
        return res.status(401).json({ message: 'Admin user not authenticated' });
    }
    const updatedUser = await userService.removeUserProfilePhoto(adminId, id, req);
    res.status(200).json(updatedUser);
});

export const assignRole = asyncHandler(async (req: Request, res: Response) => {
    const { id, roleId } = req.params;
    const adminId = req.user?.userId;
    if (!adminId) {
        return res.status(401).json({ message: 'Admin user not authenticated' });
    }
    const user = await userService.assignRoleToUser(adminId, id, parseInt(roleId), req);
    res.status(200).json(user);
});

export const removeRole = asyncHandler(async (req: Request, res: Response) => {
    const { id, roleId } = req.params;
    const adminId = req.user?.userId;
    if (!adminId) {
        return res.status(401).json({ message: 'Admin user not authenticated' });
    }
    const user = await userService.removeRoleFromUser(adminId, id, parseInt(roleId), req);
    res.status(200).json(user);
});