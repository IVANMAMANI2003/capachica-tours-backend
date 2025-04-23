import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { config } from '../config';

export interface JwtPayload {
    userId: string;
    roles: string[]; // Array de nombres de rol
    // Campos estándar de JWT
    exp?: number;    // Timestamp de expiración
    iat?: number;    // Timestamp de emisión
    sub?: string;    // Subject (normalmente el ID del usuario)
    // Puedes añadir más datos si lo necesitas (ej: email)
}

export const generateToken = (payload: JwtPayload): string => {
    const options: SignOptions = {
        expiresIn: config.jwt.expiresIn as StringValue | number,
        subject: payload.userId,
    };
    
    return jwt.sign(payload, config.jwt.secret as Secret, options);
};

export const verifyToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
        console.error('JWT Verification Error:', error);
        return null;
    }
};