import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Dirección de email inválida" }),
        password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
        nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
        apellidos: z.string().min(2, { message: "Los apellidos deben tener al menos 2 caracteres" }),
        telefono: z.string().optional(),
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Dirección de email inválida" }),
        password: z.string().min(1, { message: "La contraseña es requerida" }),
    })
});

export const verifyEmailSchema = z.object({
    params: z.object({
        token: z.string().min(1, { message: "El token es requerido" }),
    })
});

export const requestPasswordResetSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Dirección de email inválida" }),
    })
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, { message: "El token es requerido" }),
        newPassword: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
    })
});

export const resendVerificationSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Dirección de email inválida" }),
    })
});