import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/helpers';
import * as userController from '../modules/users/users.controller';
import { uploadProfilePhoto } from '../modules/storage/storage.service';
import { ApiError } from '../core/errors/ApiError';

/**
 * Función común para procesar la carga de imágenes de perfil
 * @param file Archivo a procesar
 * @param userId ID del usuario propietario del archivo
 * @returns URL pública de la imagen procesada
 */
const processProfileImage = async (file: any, userId: string): Promise<string> => {
    if (!file) {
        throw new ApiError(400, 'No se proporcionó ninguna imagen', true);
    }
    
    if (!userId) {
        throw new ApiError(401, 'Usuario no autenticado', true);
    }

    // Subir la imagen directamente a Supabase Storage y obtener la URL pública
    return await uploadProfilePhoto(userId, file.buffer, file.mimetype);
};

/**
 * Middleware para procesar la imagen de perfil y actualizar el usuario actual
 */
export const uploadMyProfilePhoto = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }
        
        // Procesar la imagen del archivo subido
        const fotoPerfilUrl = await processProfileImage(req.file, userId);
        
        // Establecer la URL de la foto en el cuerpo de la solicitud
        req.body = {
            persona: {
                foto_perfil_url: fotoPerfilUrl
            }
        };
        
        // Continuar con el controlador de usuarios
        await userController.updateMe(req, res, next);
    } catch (error: any) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode || 500).json({
                message: error.message,
                isOperational: error.isOperational
            });
        }
        
        return res.status(500).json({
            message: error.message || 'Error al procesar la imagen',
            isOperational: false
        });
    }
});

/**
 * Middleware para procesar la imagen de perfil y actualizar un usuario específico (admin)
 */
export const uploadUserProfilePhoto = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Obtener el ID del usuario objetivo desde los parámetros
        const targetUserId = req.params.id;
        if (!targetUserId) {
            return res.status(400).json({ message: 'ID de usuario no proporcionado' });
        }
        
        // Procesar la imagen del archivo subido
        const fotoPerfilUrl = await processProfileImage(req.file, targetUserId);
        
        // Establecer la URL de la foto en el cuerpo de la solicitud
        req.body = {
            persona: {
                foto_perfil_url: fotoPerfilUrl
            }
        };
        
        // Continuar con el controlador de usuarios
        await userController.updateUser(req, res, next);
    } catch (error: any) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode || 500).json({
                message: error.message,
                isOperational: error.isOperational
            });
        }
        
        return res.status(500).json({
            message: error.message || 'Error al procesar la imagen',
            isOperational: false
        });
    }
}); 