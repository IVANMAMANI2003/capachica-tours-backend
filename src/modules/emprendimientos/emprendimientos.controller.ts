import { Request, Response, NextFunction } from 'express';
import * as empService from './emprendimientos.service';
import { asyncHandler } from '../../utils/helpers';
import { ForbiddenError, BadRequestError } from '../../core/errors/ApiError';
import { JwtPayload } from '../../utils/jwt'; // Importar JwtPayload

// Middleware para extraer usuario opcionalmente (para rutas públicas/privadas)
const getOptionalUser = (req: Request): JwtPayload | undefined => {
    // Asume que authenticateToken puede haber sido llamado antes, pero no es obligatorio
    return req.user;
};

export const createEmprendimiento = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new ForbiddenError("Authentication required"); // Seguridad
    const data = req.body;
    const result = await empService.createEmprendimiento(userId, data, req);
    res.status(201).json(result);
});

export const getEmprendimientoById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new BadRequestError("Invalid Emprendimiento ID");
    const user = getOptionalUser(req); // Puede ser público o privado
    const emprendimiento = await empService.getEmprendimientoById(id, user);
    res.status(200).json(emprendimiento);
});

export const getAllEmprendimientos = asyncHandler(async (req: Request, res: Response) => {
    const user = getOptionalUser(req);
    // Extraer filtros y paginación del req.query (ya parseados por Zod si se usa)
    const { page, limit, tipo, estado, paisId, ciudadId, search } = req.query as any;
    const filters = { tipo, estado, paisId, ciudadId, search };

    const result = await empService.getAllEmprendimientos(user, filters, page, limit);
    res.status(200).json(result);
});

export const getMyEmprendimientos = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new ForbiddenError("Authentication required");
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await empService.getMyEmprendimientos(userId, page, limit);
    res.status(200).json(result);
});

export const updateEmprendimiento = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const userRoles = req.user?.roles;
    if (!userId || !userRoles) throw new ForbiddenError("Authentication required");

    const id = parseInt(req.params.id);
     if (isNaN(id)) throw new BadRequestError("Invalid Emprendimiento ID");
    const data = req.body;

    const updated = await empService.updateEmprendimiento(id, userId, userRoles, data, req);
    res.status(200).json(updated);
});

export const deleteEmprendimiento = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const userRoles = req.user?.roles;
    if (!userId || !userRoles) throw new ForbiddenError("Authentication required");

     const id = parseInt(req.params.id);
     if (isNaN(id)) throw new BadRequestError("Invalid Emprendimiento ID");

    const result = await empService.deleteEmprendimiento(id, userId, userRoles, req);
    res.status(200).json(result);
});

// --- Controladores Admin ---
 export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const adminUserId = req.user?.userId;
    if (!adminUserId) throw new ForbiddenError("Authentication required"); // Seguridad

    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new BadRequestError("Invalid Emprendimiento ID");
    const { estado } = req.body; // El schema ya validó que 'estado' existe y es válido

    const updated = await empService.updateEmprendimientoStatus(adminUserId, id, estado, req);
    res.status(200).json(updated);
});

 export const getPending = asyncHandler(async (req: Request, res: Response) => {
     const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
     const result = await empService.getPendingEmprendimientos(page, limit);
     res.status(200).json(result);
 });