import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { NotFoundError } from './core/errors/ApiError';
import { errorHandler, errorConverter } from './core/errors/errorHandlers';

// Importar rutas de los módulos
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import emprendimientoRoutes from './modules/emprendimientos/emprendimientos.routes';
import accessLogRoutes from './modules/access_logs/access_logs.routes';
import catalogRoutes from './modules/catalogs/catalogs.routes';
import rbacRoutes from './modules/rbac/rbac.routes';

const app: Express = express();

// --- Middlewares Globales ---

// Seguridad básica
app.use(helmet());

// Habilitar CORS con la configuración
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = ['http://localhost:4200', 'https://capachicawb.vercel.app'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Permitir el envío de credenciales (cookies, headers de autorización, etc.)
};

// Parsear JSON y URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de peticiones HTTP (formato 'dev' es bueno para desarrollo)
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined')); // Formato más detallado para producción
}

// --- Rutas de la API ---
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to CapachicaTurs API!');
});
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejar solicitudes de favicon.ico para evitar errores 404
app.get('/favicon.ico', (req: Request, res: Response) => {
    res.status(204).end(); // Responder con "No Content" (204)
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/emprendimientos', emprendimientoRoutes);
app.use('/api/catalogs', catalogRoutes); // Añadir rutas de catálogos
app.use('/api/rbac', rbacRoutes);         // Añadir rutas RBAC (admin)
app.use('/api/access-logs', accessLogRoutes); // Añadir rutas de logs (admin)

// --- Manejo de rutas no encontradas (404) ---
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// --- Manejo Global de Errores ---
// Primero convierte errores genéricos a ApiError
app.use(errorConverter);
// Luego maneja los ApiError y envía la respuesta
app.use(errorHandler);


export default app;
