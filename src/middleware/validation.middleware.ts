// Valida con Zod
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../core/errors/ApiError';

export const validateRequest = (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Formatear errores de Zod para que sean más legibles
                const formattedErrors = error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                // Usamos el primer error para el mensaje general, pero podrías enviar todos
                next(new BadRequestError(`Validation failed: ${formattedErrors[0]?.message || 'Invalid input'}`));
            } else {
                next(error);
            }
        }
    };