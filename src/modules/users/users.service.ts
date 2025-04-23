import { supabase } from '../../config/supabase';
import { NotFoundError, ApiError, BadRequestError, ForbiddenError } from '../../core/errors/ApiError';
import { logAccessEvent, EventType } from '../access_logs/access_logs.service';
import { Request } from 'express';
import { uploadProfilePhoto, deleteUserProfilePhoto } from '../storage/storage.service';

const USER_SELECT_FIELDS = `
    id, email, esta_activo, email_verified, ultimo_acceso, created_at, preferencias,
    persona: personas (
        id, nombre, apellidos, telefono, direccion, foto_perfil_url, fecha_nacimiento,
        subdivision: subdivisions (
            id, name,
            country: countries ( id, name, code_iso )
        )
    ),
    roles: usuarios_roles ( role:roles ( id, nombre ) )
`;

/**
 * Procesa una imagen en formato base64 y la sube al almacenamiento
 * @param userId ID del usuario propietario de la imagen
 * @param base64Image Imagen en formato base64
 * @returns URL pública de la imagen subida
 */
const processBase64Image = async (userId: string, base64Image: string): Promise<string> => {
    try {
        // Extraer datos de la imagen base64
        const base64Parts = base64Image.split(';base64,');
        const fileType = base64Parts[0].replace('data:', '');
        const base64Data = base64Parts[1];
        const fileBuffer = Buffer.from(base64Data, 'base64');
        
        // Subir la imagen a Supabase Storage
        return await uploadProfilePhoto(userId, fileBuffer, fileType);
    } catch (error: any) {
        throw new ApiError(500, 'Error al procesar la imagen de perfil', false, error.message);
    }
};

/**
 * Obtiene el ID de la persona vinculada al usuario
 * @param userId ID del usuario
 * @returns ID de la persona
 */
const getPersonaIdForUser = async (userId: string): Promise<string> => {
    const { data, error } = await supabase
        .from('usuarios')
        .select('persona_id')
        .eq('id', userId)
        .single();

    if (error || !data) {
        throw new ApiError(500, `Could not retrieve persona link for user ${userId}`, false, error?.message);
    }
    
    return data.persona_id;
};

// Obtener datos del usuario actualmente autenticado
export const getCurrentUser = async (userId: string) => {
    const { data, error } = await supabase
        .from('usuarios')
        .select(USER_SELECT_FIELDS)
        .eq('id', userId)
        .single();

    if (error || !data) {
        if (error && error.code !== 'PGRST116') throw new ApiError(500, 'Could not retrieve user profile', false, error.message);
        throw new NotFoundError('User not found');
    }
    // Remapear roles
    const roles = data.roles?.map((ur: any) => ({ id: ur.role.id, nombre: ur.role.nombre })) || [];
    return { ...data, roles };
};

// Actualizar datos del usuario actualmente autenticado
export const updateCurrentUser = async (userId: string, updateData: any) => {
    const { persona, ...userFields } = updateData;

    // 1. Actualizar tabla 'usuarios' si hay campos
    if (Object.keys(userFields).length > 0) {
        const { data, error } = await supabase
            .from('usuarios')
            .update(userFields)
            .eq('id', userId)
            .select('id') // Seleccionar algo para confirmar éxito
            .single();
        if (error) throw new ApiError(500, 'Failed to update user account data', false, error.message);
        if (!data) throw new NotFoundError('User not found for update');
    }

    // 2. Actualizar tabla 'personas' si hay campos
    if (persona && Object.keys(persona).length > 0) {
        // Obtener persona_id del usuario
        const personaId = await getPersonaIdForUser(userId);
        
        // Procesar imagen base64 si existe
        if (persona.foto_perfil_base64) {
            persona.foto_perfil_url = await processBase64Image(userId, persona.foto_perfil_base64);
            delete persona.foto_perfil_base64;
        }

        const { error: personaError } = await supabase
            .from('personas')
            .update(persona)
            .eq('id', personaId);

        if (personaError) throw new ApiError(500, 'Failed to update user profile data', false, personaError.message);
    }

    // 3. Devolver los datos actualizados del usuario
    return getCurrentUser(userId);
};


// --- Funciones solo para Admin ---

export const getAllUsers = async (page = 1, limit = 20, filters: any = {}) => {
    const offset = (page - 1) * limit;
    let query = supabase
        .from('usuarios')
        .select(`${USER_SELECT_FIELDS}`, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    // Aplicar filtros
    if (filters.email) {
         query = query.ilike('email', `%${filters.email}%`);
    }
    if (filters.active !== undefined) {
        query = query.eq('esta_activo', filters.active);
    }

    const { data, error, count } = await query;

    if (error) throw new ApiError(500, 'Could not retrieve users', false, error.message);

    // Remapear roles para cada usuario
    const users = data?.map(u => ({
        ...u,
        roles: u.roles?.map((ur: any) => ({ id: ur.role.id, nombre: ur.role.nombre })) || []
    })) || [];

    return {
        users,
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit)
    };
};

export const getUserById = async (userId: string) => {
     return getCurrentUser(userId);
};

export const updateUserById = async (adminUserId: string, targetUserId: string, updateData: any, req: Request) => {
    const { persona, ...userFields } = updateData;

    // 1. Actualizar 'usuarios'
    if (Object.keys(userFields).length > 0) {
        const { error } = await supabase
            .from('usuarios')
            .update(userFields)
            .eq('id', targetUserId);
        if (error) throw new ApiError(500, `Failed to update user ${targetUserId} account`, false, error.message);
    }

    // 2. Actualizar 'personas'
    if (persona && Object.keys(persona).length > 0) {
        // Obtener persona_id del usuario objetivo
        const personaId = await getPersonaIdForUser(targetUserId);
        
        // Procesar imagen base64 si existe
        if (persona.foto_perfil_base64) {
            persona.foto_perfil_url = await processBase64Image(targetUserId, persona.foto_perfil_base64);
            delete persona.foto_perfil_base64;
        }

        const { error: personaError } = await supabase
            .from('personas')
            .update(persona)
            .eq('id', personaId);
            
        if (personaError) throw new ApiError(500, `Failed to update profile for user ${targetUserId}`, false, personaError.message);
    }

    await logAccessEvent(EventType.USER_UPDATED_BY_ADMIN, adminUserId, req, { targetUserId, changes: Object.keys(updateData) });

    // Devolver el usuario actualizado
    return getUserById(targetUserId);
};

export const deleteUserById = async (adminUserId: string, targetUserId: string, req: Request) => {
    const { error } = await supabase
        .from('usuarios')
        .update({ esta_activo: false })
        .eq('id', targetUserId);

    if (error) throw new ApiError(500, `Failed to deactivate user ${targetUserId}`, false, error.message);

    await logAccessEvent(EventType.USER_DELETED_BY_ADMIN, adminUserId, req, { targetUserId });

    return { message: `User ${targetUserId} deactivated successfully.` };
};

export const assignRoleToUser = async (adminUserId: string, targetUserId: string, roleId: number, req: Request) => {
    // Verificar si el rol existe
    const { data: roleExists } = await supabase.from('roles').select('id').eq('id', roleId).maybeSingle();
    if (!roleExists) throw new NotFoundError(`Role with ID ${roleId} not found`);

    // Verificar si la asignación ya existe
    const { data: assignmentExists } = await supabase
        .from('usuarios_roles')
        .select('id')
        .eq('usuario_id', targetUserId)
        .eq('rol_id', roleId)
        .maybeSingle();

    if (assignmentExists) return { message: 'User already has this role' };

    const { error } = await supabase
        .from('usuarios_roles')
        .insert({ usuario_id: targetUserId, rol_id: roleId });

    if (error) throw new ApiError(500, 'Failed to assign role', false, error.message);

    await logAccessEvent(EventType.ROLE_ASSIGNED, adminUserId, req, { targetUserId, targetRoleId: roleId });
    return getUserById(targetUserId);
};

export const removeRoleFromUser = async (adminUserId: string, targetUserId: string, roleId: number, req: Request) => {
    // Verificar si el rol existe
    const { data: roleExists } = await supabase.from('roles').select('id').eq('id', roleId).maybeSingle();
    if (!roleExists) throw new NotFoundError(`Role with ID ${roleId} not found`);

    const { error, count } = await supabase
        .from('usuarios_roles')
        .delete({ count: 'exact' })
        .eq('usuario_id', targetUserId)
        .eq('rol_id', roleId);

    if (error) throw new ApiError(500, 'Failed to remove role', false, error.message);
    if (count === 0) throw new NotFoundError('Role assignment not found for this user');

    await logAccessEvent(EventType.ROLE_REMOVED, adminUserId, req, { targetUserId, targetRoleId: roleId });
    return getUserById(targetUserId);
};

// Eliminar foto de perfil del usuario actual
export const removeProfilePhoto = async (userId: string) => {
    // 1. Eliminar archivo físico en storage
    await deleteUserProfilePhoto(userId);

    // 2. Actualizar la persona para eliminar la referencia a la foto
    const personaId = await getPersonaIdForUser(userId);
    
    const { error: personaError } = await supabase
        .from('personas')
        .update({ foto_perfil_url: null })
        .eq('id', personaId);

    if (personaError) throw new ApiError(500, 'Failed to update user profile data', false, personaError.message);

    // 3. Devolver los datos actualizados del usuario
    return getCurrentUser(userId);
};

// Eliminar foto de perfil de un usuario (administrador)
export const removeUserProfilePhoto = async (adminUserId: string, targetUserId: string, req: Request) => {
    // 1. Eliminar archivo físico en storage
    await deleteUserProfilePhoto(targetUserId);

    // 2. Actualizar la persona para eliminar la referencia a la foto
    const personaId = await getPersonaIdForUser(targetUserId);
    
    const { error: personaError } = await supabase
        .from('personas')
        .update({ foto_perfil_url: null })
        .eq('id', personaId);

    if (personaError) throw new ApiError(500, `Failed to update profile for user ${targetUserId}`, false, personaError.message);

    // 3. Registrar evento de acceso
    await logAccessEvent(EventType.USER_PROFILE_PHOTO_DELETED, adminUserId, req, { targetUserId });

    // 4. Devolver el usuario actualizado
    return getUserById(targetUserId);
};