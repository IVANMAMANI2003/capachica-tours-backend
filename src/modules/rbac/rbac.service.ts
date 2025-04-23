import { supabase } from '../../config/supabase';
import { ApiError } from '../../core/errors/ApiError';

export const getRoles = async () => {
    const { data, error } = await supabase
        .from('roles')
        .select('id, nombre, descripcion')
        .order('nombre');
    if (error) throw new ApiError(500, 'Could not retrieve roles', false, error.message);
    return data;
};

export const getPermisos = async () => {
    const { data, error } = await supabase
        .from('permisos')
        .select('id, nombre, descripcion')
        .order('nombre');
    if (error) throw new ApiError(500, 'Could not retrieve permisos', false, error.message);
    return data;
};

export const getRolePermissions = async (roleId: number) => {
    const { data, error } = await supabase
        .from('roles_permisos')
        .select('permiso:permisos ( id, nombre, descripcion )')
        .eq('rol_id', roleId);

    if (error) throw new ApiError(500, `Could not retrieve permissions for role ${roleId}`, false, error.message);
    return data.map(item => item.permiso); // Devolver solo la info del permiso
};

 // TODO: Añadir servicios CRUD para Admin (createRole, assignPermission, etc.)