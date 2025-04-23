import { supabase } from '../../config/supabase';
import { NotFoundError, ApiError, ForbiddenError } from '../../core/errors/ApiError';
import { JwtPayload } from '../../utils/jwt'; // Importar JwtPayload
import { logAccessEvent, EventType } from '../access_logs/access_logs.service';
import { Request } from 'express';

// Campos a seleccionar, incluyendo datos del dueño
const EMPRENDIMIENTO_SELECT_FIELDS = `
    id, nombre, descripcion, tipo, direccion, estado, fecha_aprobacion, created_at, updated_at,
    contacto_telefono, contacto_email, sitio_web, redes_sociales,
    pais:paises ( id, nombre ),
    ciudad:ciudades ( id, nombre ),
    usuario:usuarios ( id, email, persona:personas ( nombre, apellidos, foto_perfil_url ) ),
    aprobador:aprobado_por ( id, email, persona:personas( nombre, apellidos) )
`; // Nota: 'aprobado_por' referencia a 'usuarios'

// --- Funciones para Emprendedores y Admin ---

export const createEmprendimiento = async (userId: string, data: any, req: Request) => {
    const { error } = await supabase
        .from('emprendimientos')
        .insert({
            ...data,
            usuario_id: userId,
            estado: 'pendiente', // Estado inicial siempre pendiente
        });

    if (error) throw new ApiError(500, 'Failed to create emprendimiento', false, error.message);

    // Loggear evento
    await logAccessEvent(EventType.EMPRENDIMIENTO_CREATED, userId, req);

    // No podemos devolver el ID fácilmente sin otro select, devolvemos mensaje
    return { message: 'Emprendimiento created successfully and pending approval.' };
};

// Servicio Interno para verificar permisos de acceso a un emprendimiento
const checkEmprendimientoAccess = (emprendimiento: any, user?: JwtPayload): boolean => {
    if (!emprendimiento) return false;

    // Público puede ver solo aprobados
    if (emprendimiento.estado === 'aprobado') return true;

    // Si no está aprobado, se necesita estar logueado
    if (!user) return false;

    // Admin puede ver todo
    if (user.roles.includes('admin')) return true;

    // Dueño puede ver su propio emprendimiento en cualquier estado
    if (user.roles.includes('emprendedor') && emprendimiento.usuario_id === user.userId) return true;

    // Otros casos no tienen acceso
    return false;
};


export const getEmprendimientoById = async (id: number, user?: JwtPayload) => {
    const { data: emprendimiento, error } = await supabase
        .from('emprendimientos')
        .select(EMPRENDIMIENTO_SELECT_FIELDS)
        .eq('id', id)
        .maybeSingle(); // Puede no existir

    if (error) throw new ApiError(500, 'Error retrieving emprendimiento', false, error.message);
    if (!emprendimiento) throw new NotFoundError(`Emprendimiento with ID ${id} not found`);

    // Verificar permiso de acceso
    if (!checkEmprendimientoAccess(emprendimiento, user)) {
         // Si no tiene acceso, actuar como si no existiera para el usuario
         throw new NotFoundError(`Emprendimiento with ID ${id} not found`);
    }

    return emprendimiento;
};

// Para que el emprendedor obtenga SUS emprendimientos
export const getMyEmprendimientos = async (userId: string, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const { data, error, count } = await supabase
        .from('emprendimientos')
        .select(EMPRENDIMIENTO_SELECT_FIELDS, { count: 'exact' })
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw new ApiError(500, 'Could not retrieve your emprendimientos', false, error.message);

    return {
        emprendimientos: data,
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit)
    };
};


export const updateEmprendimiento = async (id: number, userId: string, userRoles: string[], data: any, req: Request) => {
    // 1. Obtener el emprendimiento para verificar propiedad o rol admin
    const { data: current, error: findError } = await supabase
        .from('emprendimientos')
        .select('id, usuario_id, estado')
        .eq('id', id)
        .single();

    if (findError) throw new ApiError(500, 'Error finding emprendimiento', false, findError.message);
    if (!current) throw new NotFoundError(`Emprendimiento with ID ${id} not found`);

    // 2. Verificar permisos (dueño o admin)
    const isOwner = current.usuario_id === userId;
    const isAdmin = userRoles.includes('admin');

    if (!isOwner && !isAdmin) {
        throw new ForbiddenError('You do not have permission to update this emprendimiento');
    }

    // 3. Si es el dueño quien actualiza, ¿resetear estado a 'pendiente'? (Decisión de negocio)
    // let finalData = data;
    // if (isOwner && current.estado !== 'pendiente') {
    //     console.log(`Owner updated approved/rejected emprendimiento ${id}. Setting status back to pending.`);
    //     finalData = { ...data, estado: 'pendiente', fecha_aprobacion: null, aprobado_por: null };
    // }

    // 4. Realizar la actualización
    const { error: updateError } = await supabase
        .from('emprendimientos')
        .update(data) // Usar 'data' o 'finalData' según la decisión anterior
        .eq('id', id);

    if (updateError) throw new ApiError(500, 'Failed to update emprendimiento', false, updateError.message);

    await logAccessEvent(EventType.EMPRENDIMIENTO_UPDATED, userId, req, { targetEmprendimientoId: id, isAdminUpdate: isAdmin });

    // 5. Devolver el emprendimiento actualizado
    return getEmprendimientoById(id, { userId, roles: userRoles }); // Pasar user para re-verificar acceso
};

export const deleteEmprendimiento = async (id: number, userId: string, userRoles: string[], req: Request) => {
    // 1. Verificar propiedad o rol admin
    const { data: current, error: findError } = await supabase
        .from('emprendimientos')
        .select('id, usuario_id')
        .eq('id', id)
        .single();

    if (findError) throw new ApiError(500, 'Error finding emprendimiento', false, findError.message);
    if (!current) throw new NotFoundError(`Emprendimiento with ID ${id} not found`);

    const isOwner = current.usuario_id === userId;
    const isAdmin = userRoles.includes('admin');

    if (!isOwner && !isAdmin) {
        throw new ForbiddenError('You do not have permission to delete this emprendimiento');
    }

    // 2. Realizar el borrado
    const { error: deleteError } = await supabase
        .from('emprendimientos')
        .delete()
        .eq('id', id);

    if (deleteError) throw new ApiError(500, 'Failed to delete emprendimiento', false, deleteError.message);

     await logAccessEvent(EventType.EMPRENDIMIENTO_DELETED, userId, req, { targetEmprendimientoId: id, isAdminDelete: isAdmin });

    return { message: `Emprendimiento ${id} deleted successfully.` };
};


// --- Funciones Públicas y Admin ---

export const getAllEmprendimientos = async (user: JwtPayload | undefined, filters: any, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    let query = supabase
        .from('emprendimientos')
        .select(EMPRENDIMIENTO_SELECT_FIELDS, { count: 'exact' })
        .order('created_at', { ascending: false }) // O por nombre, etc.
        .range(offset, offset + limit - 1);

    const isAdmin = user?.roles.includes('admin');

    // Filtro de estado: Público solo ve aprobados, Admin puede filtrar por cualquier estado
    if (isAdmin && filters.estado) {
        query = query.eq('estado', filters.estado);
    } else if (!isAdmin) {
         // Si no es admin, forzar a ver solo aprobados
         query = query.eq('estado', 'aprobado');
    }
     // else: Admin sin filtro de estado ve todos

    // Otros filtros
    if (filters.tipo) {
        query = query.eq('tipo', filters.tipo);
    }
    if (filters.paisId) {
        query = query.eq('pais_id', filters.paisId);
    }
     if (filters.ciudadId) {
        query = query.eq('ciudad_id', filters.ciudadId);
    }
    if (filters.search) {
        // Buscar en nombre O descripción (usar or)
         query = query.or(`nombre.ilike.%<span class="math-inline">\{filters\.search\}%,descripcion\.ilike\.%</span>{filters.search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw new ApiError(500, 'Could not retrieve emprendimientos', false, error.message);

    return {
        emprendimientos: data,
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit)
    };
};

// --- Funciones solo Admin ---

export const updateEmprendimientoStatus = async (adminUserId: string, id: number, newStatus: string, req: Request) => {
     const { data: current, error: findError } = await supabase
        .from('emprendimientos')
        .select('id, estado')
        .eq('id', id)
        .single();

    if (findError) throw new ApiError(500, 'Error finding emprendimiento', false, findError.message);
    if (!current) throw new NotFoundError(`Emprendimiento with ID ${id} not found`);

    if (current.estado === newStatus) {
        return { message: `Emprendimiento <span class="math-inline">\{id\} is already in status '</span>{newStatus}'` };
    }

    const updatePayload: any = {
        estado: newStatus,
        aprobado_por: null, // Resetear por defecto
        fecha_aprobacion: null
    };

    if (newStatus === 'aprobado') {
        updatePayload.aprobado_por = adminUserId;
        updatePayload.fecha_aprobacion = new Date().toISOString();
    }

    const { error: updateError } = await supabase
        .from('emprendimientos')
        .update(updatePayload)
        .eq('id', id);

    if (updateError) throw new ApiError(500, `Failed to update status for emprendimiento ${id}`, false, updateError.message);

    await logAccessEvent(EventType.EMPRENDIMIENTO_STATUS_CHANGED, adminUserId, req, {
        targetEmprendimientoId: id,
        previousStatus: current.estado,
        newStatus: newStatus
    });

    // Devolver el emprendimiento actualizado
    return getEmprendimientoById(id, { userId: adminUserId, roles: ['admin'] }); // Simular user admin
};

// Opcional: Endpoint específico para pendientes
export const getPendingEmprendimientos = async (page = 1, limit = 10) => {
     const offset = (page - 1) * limit;
     const { data, error, count } = await supabase
        .from('emprendimientos')
        .select(EMPRENDIMIENTO_SELECT_FIELDS, { count: 'exact' })
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: true }) // Mostrar los más antiguos primero
        .range(offset, offset + limit - 1);

     if (error) throw new ApiError(500, 'Could not retrieve pending emprendimientos', false, error.message);

     return {
        emprendimientos: data,
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit)
    };
};