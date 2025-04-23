import { Request, Response } from 'express';
import * as rbacService from './rbac.service';
import { asyncHandler } from '../../utils/helpers';
import { BadRequestError } from '../../core/errors/ApiError';


export const fetchRoles = asyncHandler(async (req: Request, res: Response) => {
    const roles = await rbacService.getRoles();
    res.status(200).json(roles);
});

export const fetchPermisos = asyncHandler(async (req: Request, res: Response) => {
    const permisos = await rbacService.getPermisos();
    res.status(200).json(permisos);
});

export const fetchRolePermissions = asyncHandler(async (req: Request, res: Response) => {
    const roleId = parseInt(req.params.roleId);
    if (isNaN(roleId)) throw new BadRequestError("Invalid Role ID");
    const permissions = await rbacService.getRolePermissions(roleId);
    res.status(200).json(permissions);
});

// TODO: Añadir controladores CRUD para Admin