import { supabase } from '../../config/supabase';
import { ApiError } from '../../core/errors/ApiError';
import { Request } from 'express'; // Import Request type

export enum EventType {
    LOGIN_SUCCESS = 'login_success',
    LOGIN_FAILURE = 'login_failure',
    LOGOUT = 'logout',
    REGISTER_SUCCESS = 'register_success',
    PASSWORD_RESET_REQUEST = 'password_reset_request',
    PASSWORD_RESET_SUCCESS = 'password_reset_success',
    EMAIL_VERIFICATION_REQUEST = 'email_verification_request',
    EMAIL_VERIFIED = 'email_verified',
    EMPRENDIMIENTO_CREATED = 'emprendimiento_created',
    EMPRENDIMIENTO_UPDATED = 'emprendimiento_updated',
    EMPRENDIMIENTO_DELETED = 'emprendimiento_deleted',
    EMPRENDIMIENTO_STATUS_CHANGED = 'emprendimiento_status_changed',
    USER_UPDATED_BY_ADMIN = 'user_updated_by_admin',
    USER_DELETED_BY_ADMIN = 'user_deleted_by_admin',
    USER_PROFILE_PHOTO_DELETED = 'user_profile_photo_deleted',
    ROLE_ASSIGNED = 'role_assigned',
    ROLE_REMOVED = 'role_removed',
    VERIFICATION_EMAIL_RESENT = 'verification_email_resent',
}

interface LogDetails {
    targetUserId?: string; // ID del usuario afectado (si es diferente al actor)
    targetEmprendimientoId?: number;
    targetRoleId?: number;
    previousStatus?: string; // Para cambios de estado
    newStatus?: string;
    errorMessage?: string; // Para fallos
    [key: string]: any; // Para detalles adicionales
}

export const logAccessEvent = async (
    eventType: EventType,
    actorUserId: string | null, // Puede ser null para eventos pre-login/registro
    req: Request | null, // Pasar la request para obtener IP/User-Agent
    details: LogDetails = {}
) => {
    try {
        const ipAddress = req ? (req.headers['x-forwarded-for'] as string || req.socket?.remoteAddress) : null;
        const userAgent = req ? req.headers['user-agent'] : null;

        const { error } = await supabase
            .from('registro_accesos')
            .insert({
                usuario_id: actorUserId,
                ip_address: ipAddress,
                user_agent: userAgent,
                tipo_evento: eventType,
                detalles: details,
            });

        if (error) {
            console.error(`Failed to log access event (${eventType}):`, error.message);
            // No lanzar un error aquí para no interrumpir el flujo principal
        }
    } catch (err) {
        console.error(`Exception during access event logging (${eventType}):`, err);
    }
};

// Servicio para obtener logs (Admin)
export const getAccessLogs = async (page = 1, limit = 20, filters: any = {}) => {
    const offset = (page - 1) * limit;
    let query = supabase
        .from('registro_accesos')
        .select(`
            *,
            usuario:usuarios ( id, email, persona:personas ( nombre, apellidos ) )
        `, { count: 'exact' }) // Contar el total para paginación
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    // Aplicar filtros básicos (ejemplo)
    if (filters.userId) {
        query = query.eq('usuario_id', filters.userId);
    }
    if (filters.eventType) {
        query = query.eq('tipo_evento', filters.eventType);
    }
    // Añadir más filtros según necesidad (rango de fechas, IP, etc.)

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching access logs:", error);
        throw new ApiError(500, 'Could not retrieve access logs');
    }

    return {
        logs: data,
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit)
    };
};