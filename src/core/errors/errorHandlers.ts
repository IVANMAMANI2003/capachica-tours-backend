import { Request, Response, NextFunction } from 'express';
import { ApiError } from './ApiError';
import { config } from '../../config';

// Middleware para convertir errores no-ApiError a ApiError
export const errorConverter = (err: any, req: Request, res: Response, next: NextFunction) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message, false, err.stack); // Marcar como no operacional
    }
    next(error);
};

// Middleware para manejar errores y enviar respuesta JSON
export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
    let { statusCode, message } = err;

    // No filtrar errores no operacionales en desarrollo para debugging
    if (config.nodeEnv === 'production' && !err.isOperational) {
        statusCode = 500;
        message = 'Internal Server Error';
    }

    res.locals.errorMessage = err.message; // Para logging si es necesario

    const response = {
        code: statusCode,
        message,
        ...(config.nodeEnv === 'development' && { stack: err.stack }), // Incluir stack en desarrollo
    };

    console.error("API Error:", err); // Loggear el error

    res.status(statusCode).json(response);
};