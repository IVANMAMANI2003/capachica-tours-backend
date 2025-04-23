import app from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
    console.log(`------------------------------------------------------------`);
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Supabase URL: ${config.supabase.url ? 'Connected' : 'Not Connected'}`);
    console.log(`------------------------------------------------------------`);
});

// Manejo de cierre ordenado (opcional pero recomendado)
const signals = ['SIGINT', 'SIGTERM'];

signals.forEach(signal => {
    process.on(signal, () => {
        console.log(`\nReceived ${signal}. Shutting down gracefully...`);
        server.close(() => {
            console.log('✅ HTTP server closed.');
            // Aquí podrías cerrar conexiones a DB si no se cierran automáticamente
            process.exit(0);
        });
    });
});

// Manejo de errores no capturados (último recurso)
process.on('uncaughtException', (error) => {
    console.error('🚨 UNCAUGHT EXCEPTION! Shutting down...', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 UNHANDLED REJECTION! Shutting down...', reason);
    process.exit(1);
});