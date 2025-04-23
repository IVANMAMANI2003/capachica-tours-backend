import { randomUUID } from 'crypto'; // Usar crypto nativo de Node

export const generateRandomToken = (): string => {
    return randomUUID();
};

// Función para envolver controladores async y capturar errores
export const asyncHandler = (fn: Function) =>
    (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next);