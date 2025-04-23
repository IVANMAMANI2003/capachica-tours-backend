// Verifica JWT, roles
import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../core/errors/ApiError';
import { isTokenInvalidated } from '../modules/auth/auth.service';

// Extender la interfaz Request de Express para incluir 'user'
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload; // Aquí almacenaremos los datos del usuario decodificados
        }
    }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return next(new UnauthorizedError('Access token is missing or invalid'));
    }

    // Verificar si el token ha sido invalidado (logout) - ahora es async
    try {
        const isInvalidated = await isTokenInvalidated(token);
        if (isInvalidated) {
            return next(new UnauthorizedError('La sesión ha caducado o ha sido cerrada. Por favor, inicie sesión nuevamente.'));
        }
        
        const payload = verifyToken(token);

        if (!payload) {
            return next(new UnauthorizedError('Invalid or expired token'));
        }

        req.user = payload; // Adjuntar payload decodificado a la request
        
        next();
    } catch (error) {
        console.error('Error verificando token:', error);
        return next(new UnauthorizedError('Error durante la autenticación'));
    }
};

// Middleware Factory para verificar roles
export const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.roles) {
            // Esto no debería pasar si authenticateToken se ejecutó antes
            return next(new UnauthorizedError('Authentication required'));
        }

        const hasRole = req.user.roles.some(role => allowedRoles.includes(role));

        if (!hasRole) {
            return next(new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`));
        }

        next();
    };
};