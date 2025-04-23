import { Request, Response } from 'express';
import * as catalogService from './catalogs.service';
import { asyncHandler } from '../../utils/helpers';
import { BadRequestError } from '../../core/errors/ApiError';

// Nuevos endpoints para Countries y Subdivisions
export const fetchCountries = asyncHandler(async (req: Request, res: Response) => {
    const countries = await catalogService.getCountries();
    res.status(200).json(countries);
});

export const fetchSubdivisions = asyncHandler(async (req: Request, res: Response) => {
    let countryId: number | undefined = undefined;
    if (req.query.countryId) {
         countryId = parseInt(req.query.countryId as string);
         if (isNaN(countryId)) throw new BadRequestError("Invalid countryId query parameter");
    }
    const subdivisions = await catalogService.getSubdivisions(countryId);
    res.status(200).json(subdivisions);
});

// TODO: Añadir controladores CRUD para Admin