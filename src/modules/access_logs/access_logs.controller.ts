import { Request, Response, NextFunction } from 'express';
import * as logService from './access_logs.service';
import { asyncHandler } from '../../utils/helpers';

export const fetchLogs = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    // Extraer filtros del query (userId, eventType, etc.)
    const filters = {
        userId: req.query.userId,
        eventType: req.query.eventType
        // ... otros filtros
    };

    const result = await logService.getAccessLogs(page, limit, filters);
    res.status(200).json(result);
});