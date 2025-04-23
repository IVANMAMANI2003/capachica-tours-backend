import { z } from 'zod';

const emprendimientoTypes = z.enum(['Hospedaje', 'Guía', 'Comida', 'Cultura', 'Fotografía']);
const emprendimientoStatus = z.enum(['pendiente', 'aprobado', 'rechazado', 'suspendido']);

const baseEmprendimientoSchema = z.object({
    nombre: z.string().min(3).max(200),
    descripcion: z.string().optional().nullable(),
    tipo: emprendimientoTypes,
    direccion: z.string().optional().nullable(),
    subdivision_id: z.number().int().positive().optional().nullable(),
    // coordenadas: z.any().optional(), // Tipo POINT es complejo de validar con Zod, validar en servicio si es necesario
    contacto_telefono: z.string().max(20).optional().nullable(),
    contacto_email: z.string().email().optional().nullable(),
    sitio_web: z.string().url().optional().nullable(),
    redes_sociales: z.record(z.string().url()).optional().nullable(), // Espera un objeto { facebook: "url", instagram: "url" }
});

export const createEmprendimientoSchema = z.object({
    body: baseEmprendimientoSchema, // Al crear, el estado es 'pendiente' por defecto
});

export const updateEmprendimientoSchema = z.object({
     params: z.object({
        id: z.string().regex(/^\d+$/, "Emprendimiento ID must be a number"),
    }),
    body: baseEmprendimientoSchema
        .partial() // Todos los campos son opcionales al actualizar
        .extend({
             // Permitir al admin cambiar el estado directamente? O usar endpoint específico?
             // estado: emprendimientoStatus.optional() // Descomentar si se permite aquí
        })
});

 export const getEmprendimientoByIdSchema = z.object({
     params: z.object({
        id: z.string().regex(/^\d+$/, "Emprendimiento ID must be a number"),
    }),
});

export const updateStatusSchema = z.object({
     params: z.object({
        id: z.string().regex(/^\d+$/, "Emprendimiento ID must be a number"),
    }),
    body: z.object({
        estado: emprendimientoStatus, // Estado es obligatorio aquí
         // Podrías añadir un campo opcional 'motivo' para rechazo/suspensión
         motivo: z.string().optional().nullable(),
    })
});

// Schema para filtros de GET all
export const getEmprendimientosSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 1),
        limit: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 10),
        tipo: emprendimientoTypes.optional(),
        estado: emprendimientoStatus.optional(), // Permitir filtrar por estado (admin)
        subdivisionId: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : undefined),
        search: z.string().optional(), // Para búsqueda por nombre/descripción
    })
});