import express from 'express';
import * as catalogController from './catalogs.controller';
// import { authenticateToken, checkRole } from '../../middleware/auth.middleware';
// import { validateRequest } from '../../middleware/validation.middleware';
// import { createPaisSchema, etc... } from './catalogs.validation'; // Si se crean

const router = express.Router();

// Nuevas rutas para catálogos
router.get('/countries', catalogController.fetchCountries);
router.get('/subdivisions', catalogController.fetchSubdivisions); // /subdivisions?countryId=X

// --- Rutas Admin para CRUD de Catálogos (Ejemplo) ---
// router.post('/countries', authenticateToken, checkRole(['admin']), validateRequest(createCountrySchema), catalogController.createCountry);
// router.put('/countries/:id', authenticateToken, checkRole(['admin']), validateRequest(updateCountrySchema), catalogController.updateCountry);
// ...etc para countries y subdivisions

export default router;