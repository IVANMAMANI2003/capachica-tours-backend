import { z } from 'zod';

// Schema para actualizar datos de persona por el propio usuario o admin
const personaUpdateSchema = z.object({
    nombre: z.string().min(2).max(100).optional(),
    apellidos: z.string().min(2).max(100).optional(),
    telefono: z.string().max(20).optional().nullable(),
    direccion: z.string().optional().nullable(),
    foto_perfil_url: z.string().url().optional().nullable(),
    foto_perfil_base64: z.string().regex(/^data:image\/(jpeg|png|jpg|gif);base64,/).optional(),
    fecha_nacimiento: z.string().date().optional().nullable(), // Validar formato fecha (YYYY-MM-DD)
    subdivision_id: z.number().int().positive().optional().nullable(),
}).strict(); // No permitir campos extra

// Schema para actualizar datos de usuario por el propio usuario
export const updateMeSchema = z.object({
    body: z.object({
        // Campos de 'usuarios' que el usuario puede cambiar
        preferencias: z.record(z.unknown()).optional(), // Aceptar cualquier JSON
        // Campos de 'personas' anidados
        persona: personaUpdateSchema.optional()
    })
});

// Schema para actualizar datos de usuario por el admin
export const updateUserByAdminSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid User ID format"),
    }),
    body: z.object({
        // Campos de 'usuarios' que el admin puede cambiar
        email: z.string().email().optional(), // Cambiar email requeriría re-verificación
        esta_activo: z.boolean().optional(),
        // email_verified: z.boolean().optional(), // Cuidado al cambiar esto manualmente
        preferencias: z.record(z.unknown()).optional(),
        // Datos de persona también actualizables por admin
        persona: personaUpdateSchema.optional()
    })
});

// Schema para asignar/quitar rol
export const manageUserRoleSchema = z.object({
     params: z.object({
        id: z.string().uuid("Invalid User ID format"),
        roleId: z.string().regex(/^\d+$/, "Role ID must be a number"), // Convertir a número en el controlador/servicio
    }),
});

// Schema para GET con ID
export const getUserByIdSchema = z.object({
     params: z.object({
        id: z.string().uuid("Invalid User ID format"),
    }),
});

// Exportar los esquemas que ahora usaremos en el controlador
export const updateProfileSchema = updateMeSchema;
export const updateUserSchema = updateUserByAdminSchema;