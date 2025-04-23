// Carga y exporta variables de entorno
import dotenv from 'dotenv';

dotenv.config();

export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000/api', // URL del frontend para los enlaces en los emails
    supabase: {
        url: process.env.SUPABASE_URL as string,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    },
    jwt: {
        secret: process.env.JWT_SECRET as string,
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    }
};

// Validar que las variables criticas esten definidas
if (!config.supabase.url || !config.supabase.serviceRoleKey || !config.jwt.secret) {
    console.error("FATAL ERROR: Missing critical environment variables (Supabase URL/Key, JWT Secret).");
    process.exit(1);
}
