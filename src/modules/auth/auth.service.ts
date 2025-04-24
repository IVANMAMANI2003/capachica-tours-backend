import bcrypt from 'bcrypt';
import { supabase } from '../../config/supabase';
import { config } from '../../config';
import { generateToken, JwtPayload } from '../../utils/jwt';
import { ApiError, BadRequestError, UnauthorizedError } from '../../core/errors/ApiError';
import { z } from 'zod';
import { registerSchema } from './auth.validation';
import { logAccessEvent, EventType } from '../access_logs/access_logs.service';
import { generateRandomToken } from '../../utils/helpers';
import { Request } from 'express';
import crypto from 'crypto';

type RegisterBody = z.infer<typeof registerSchema>['body'];

// Función para hashear un token antes de almacenarlo por seguridad
const hashToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

// Función para comprobar si un token está invalidado
export const isTokenInvalidated = async (token: string): Promise<boolean> => {
    if (!token) return false;
    
    const tokenHash = hashToken(token);
    
    const { data, error } = await supabase
        .from('tokens_invalidados')
        .select('id')
        .eq('token_hash', tokenHash)
        .maybeSingle();
    
    if (error) {
        console.error('Error al verificar token invalidado:', error);
        return false; // En caso de error, permitimos continuar (opción más segura sería true)
    }
    
    return !!data; // true si el token está en la lista negra
};

const getRoleId = async (roleName: string): Promise<number> => {
    // ... (igual que antes)
    const { data, error } = await supabase
        .from('roles')
        .select('id')
        .eq('nombre', roleName)
        .single();

    if (error || !data) {
        console.error(`Error fetching role '${roleName}':`, error);
        throw new ApiError(500, `Could not find role: ${roleName}`);
    }
    return data.id;
};

export const register = async (userData: RegisterBody, req: Request) => {
    const { email, password, nombre, apellidos, telefono } = userData;

    const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (checkError) throw new ApiError(500, "Error checking user existence", false, checkError.message);
    if (existingUser) throw new BadRequestError('Email address already in use');

    const passwordHash = await bcrypt.hash(password, config.bcrypt.saltRounds);
    const verificationToken = generateRandomToken(); // Para verificación de email

    // Usar transacción simulada (insertar, luego asociar)
    let personaId: string | null = null;
    let usuarioId: string | null = null;

    try {
        // 1. Crear Persona
        const { data: personaData, error: personaError } = await supabase
            .from('personas')
            .insert({ nombre, apellidos, telefono })
            .select('id')
            .single();
        if (personaError || !personaData) throw new ApiError(500, 'Failed to create user profile', false, personaError?.message);
        personaId = personaData.id;

        // 2. Crear Usuario
        const { data: usuarioData, error: usuarioError } = await supabase
            .from('usuarios')
            .insert({
                persona_id: personaId,
                email: email,
                password_hash: passwordHash,
                email_verification_token: verificationToken,
                email_verified: false,
                esta_activo: true // Activo por defecto, pero no verificado
            })
            .select('id, email')
            .single();
        if (usuarioError || !usuarioData) throw new ApiError(500, 'Failed to create user account', false, usuarioError?.message);
        usuarioId = usuarioData.id;

        // 3. Asignar Rol Cliente
        const clienteRoleId = await getRoleId('cliente');
        const { error: roleError } = await supabase
            .from('usuarios_roles')
            .insert({ usuario_id: usuarioId, rol_id: clienteRoleId });
        if (roleError) throw new ApiError(500, 'Failed to assign default role', false, roleError.message);

        // 4. Log de registro
        await logAccessEvent(EventType.REGISTER_SUCCESS, usuarioId, req);

        // 5. En lugar de enviar email, retornamos el token directamente para pruebas
        // Construir la URL de verificación para pruebas
        const verificationUrl = `${config.clientUrl}/auth/verify-email/${verificationToken}`;

        return {
            id: usuarioId,
            email: usuarioData.email,
            nombre: nombre,
            apellidos: apellidos,
            roles: ['cliente'],
            message: "Registration successful. Please check your email to verify your account.",
            // Solo en modo desarrollo, incluir el token y la URL para pruebas
            verificationToken: config.nodeEnv === 'development' ? verificationToken : undefined,
            verificationUrl: config.nodeEnv === 'development' ? verificationUrl : undefined
        };

    } catch (error: any) {
        console.error("Registration failed, attempting rollback:", error.message);
        // Rollback manual si algo falló
        if (usuarioId) await supabase.from('usuarios').delete().eq('id', usuarioId);
        if (personaId) await supabase.from('personas').delete().eq('id', personaId);
        // Re-lanzar el error original o uno más genérico
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, error.message || 'User registration failed');
    }
};

export const login = async (email: string, passwordAttempt: string, req: Request) => {
    // Primero obtenemos el usuario
    const { data: user, error: findError } = await supabase
        .from('usuarios')
        .select('id, email, password_hash, esta_activo, email_verified, persona_id')
        .eq('email', email)
        .single();

    if (findError || !user) {
        if (findError && findError.code !== 'PGRST116') throw new ApiError(500, 'Login error', false, findError.message);
        await logAccessEvent(EventType.LOGIN_FAILURE, null, req, { email, reason: 'User not found' });
        throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.esta_activo) {
        await logAccessEvent(EventType.LOGIN_FAILURE, user.id, req, { reason: 'Account inactive' });
        throw new UnauthorizedError('Account is inactive');
    }

    // Opcional: Requerir verificación de email para login
    // if (!user.email_verified) {
    //     await logAccessEvent(EventType.LOGIN_FAILURE, user.id, req, { reason: 'Email not verified' });
    //     throw new UnauthorizedError('Please verify your email address before logging in.');
    // }

    const isPasswordValid = await bcrypt.compare(passwordAttempt, user.password_hash);
    if (!isPasswordValid) {
        await logAccessEvent(EventType.LOGIN_FAILURE, user.id, req, { reason: 'Invalid password' });
        throw new UnauthorizedError('Invalid email or password');
    }

    // Obtener roles del usuario (directo, sin RLS ni current_user_id)
    const { data: rolesData, error: rolesError } = await supabase
        .from('usuarios_roles')
        .select(`
            rol_id,
            rol:roles(nombre)
        `)
        .eq('usuario_id', user.id);

    // Extraer los nombres de los roles
    const roles: string[] = [];
    if (!rolesError && rolesData && rolesData.length > 0) {
        const extractedRoles = rolesData
            .map((r: any) => r.rol?.nombre)
            .filter((name: string | undefined): name is string => !!name);
        
        roles.push(...extractedRoles);
    }
    
    // Crear payload para el token JWT
    const payload: JwtPayload = { userId: user.id, roles };
    
    // Generar token
    const authToken = generateToken(payload);

    // Actualizar último acceso
    await supabase.from('usuarios').update({ ultimo_acceso: new Date().toISOString() }).eq('id', user.id);
    await logAccessEvent(EventType.LOGIN_SUCCESS, user.id, req);

    // Obtener datos de persona
    const { data: personaData, error: personaError } = await supabase
        .from('personas')
        .select('nombre, apellidos')
        .eq('id', user.persona_id)
        .maybeSingle();

    if (personaError) {
        console.error('Error obteniendo datos de persona:', personaError);
    }

    // Retornar resultado con la información disponible
    return {
        token: authToken,
        user: {
            id: user.id,
            email: user.email,
            nombre: personaData?.nombre || null,
            apellidos: personaData?.apellidos || null,
            roles: roles,
            email_verified: user.email_verified, // Incluir estado de verificación
        },
    };
};

export const logout = async (userId: string, req: Request) => {
    try {
        // Obtener el token del header de autorización
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        
        if (token) {
            // Obtener la información de JWT para calcular la fecha de expiración
            let expirationTime: Date;
            
            // Obtener payload del token actual si está disponible
            const payload = req.user as JwtPayload;
            
            if (payload && payload.exp) {
                // Si el payload tiene timestamp de expiración, usarlo
                expirationTime = new Date(payload.exp * 1000);
            } else {
                // Si no, usar el valor por defecto de la configuración o 24 horas
                const defaultExpiry = config.jwt.expiresIn ? 
                    typeof config.jwt.expiresIn === 'string' ?
                        parseInt(config.jwt.expiresIn) : config.jwt.expiresIn
                    : 24 * 60 * 60; // 24 horas en segundos
                
                expirationTime = new Date(Date.now() + defaultExpiry * 1000);
            }
            
            // Hashear el token por seguridad
            const tokenHash = hashToken(token);
            
            // Guardar en la base de datos
            const { error } = await supabase
                .from('tokens_invalidados')
                .insert({
                    token_hash: tokenHash,
                    usuario_id: userId,
                    invalidado_en: new Date().toISOString(),
                    expira_en: expirationTime.toISOString(),
                    metadata: { 
                        ip: req.ip, 
                        userAgent: req.headers['user-agent'] 
                    }
                });
                
            if (error) {
                console.error('Error al invalidar token en BD:', error);
                // Continuamos con el logout aunque falle el registro en BD
            }
        }
        
        // Registrar el evento de logout
        await logAccessEvent(EventType.LOGOUT, userId, req);
        
        return { message: 'Sesión cerrada correctamente' };
    } catch (error: any) {
        console.error('Error en logout:', error);
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, 'Error al cerrar sesión', false, error.message);
    }
};

export const verifyEmail = async (token: string, req: Request | null = null) => {
    const { data: user, error } = await supabase
        .from('usuarios')
        .select('id, email_verified')
        .eq('email_verification_token', token)
        .maybeSingle(); // Puede que el token no exista o ya se haya usado

    if (error) throw new ApiError(500, 'Error verifying email token', false, error.message);
    if (!user) throw new BadRequestError('Invalid or expired verification token');
    if (user.email_verified) return { message: 'Email already verified' }; // Ya verificado

    const { error: updateError } = await supabase
        .from('usuarios')
        .update({
            email_verified: true,
            email_verification_token: null, // Limpiar el token
        })
        .eq('id', user.id);

    if (updateError) throw new ApiError(500, 'Failed to update email verification status', false, updateError.message);

    await logAccessEvent(EventType.EMAIL_VERIFIED, user.id, req);

    return { message: 'Email verified successfully' };
};

/**
 * Reenvía el email de verificación para un usuario ya registrado
 * @param email Email del usuario registrado
 * @param req Request object para logging
 */
export const resendVerificationEmail = async (email: string, req: Request) => {
    // Buscar al usuario por email
    const { data: user, error } = await supabase
        .from('usuarios')
        .select('id, email, email_verified, persona_id')
        .eq('email', email)
        .maybeSingle();

    if (error) throw new ApiError(500, 'Error finding user', false, error.message);
    if (!user) throw new BadRequestError('No account found with that email address');
    
    // Si el email ya está verificado, no es necesario reenviar
    if (user.email_verified) {
        return { message: 'Email already verified. You can log in.' };
    }
    
    // Generar un nuevo token
    const verificationToken = generateRandomToken();
    
    // Actualizar el token en la base de datos
    const { error: updateError } = await supabase
        .from('usuarios')
        .update({
            email_verification_token: verificationToken
        })
        .eq('id', user.id);
        
    if (updateError) throw new ApiError(500, 'Failed to generate verification token', false, updateError.message);
    
    // Obtener el nombre para personalizar el email (aunque no lo enviemos ahora)
    const { data: personaData } = await supabase
        .from('personas')
        .select('nombre')
        .eq('id', user.persona_id)
        .maybeSingle();
        
    // Registrar el evento
    await logAccessEvent(EventType.VERIFICATION_EMAIL_RESENT, user.id, req);
    
    // Construir la URL de verificación para pruebas
    const verificationUrl = `${config.clientUrl}/auth/verify-email/${verificationToken}`;
    
    // En desarrollo, devolver el token para pruebas
    return {
        message: 'Verification email has been resent.',
        // Solo en modo desarrollo, incluir información para pruebas
        verificationToken: config.nodeEnv === 'development' ? verificationToken : undefined,
        verificationUrl: config.nodeEnv === 'development' ? verificationUrl : undefined
    };
};

export const requestPasswordReset = async (email: string, req: Request) => {
    const { data: user, error } = await supabase
        .from('usuarios')
        .select('id, email, esta_activo, persona_id')
        .eq('email', email)
        .single();

    if (error && error.code !== 'PGRST116') throw new ApiError(500, 'Error finding user', false, error.message);
    if (!user || !user.esta_activo) {
        // No revelar si el email existe o no por seguridad
        console.warn(`Password reset requested for non-existent or inactive user: ${email}`);
        return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    const resetToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 3600 * 1000); // Token expira en 1 hora

    const { error: updateError } = await supabase
        .from('usuarios')
        .update({
            recovery_token: resetToken,
            recovery_token_expires_at: expiresAt.toISOString(),
        })
        .eq('id', user.id);

    if (updateError) throw new ApiError(500, 'Failed to generate password reset token', false, updateError.message);

    await logAccessEvent(EventType.PASSWORD_RESET_REQUEST, user.id, req);

    // Construir la URL de restablecimiento para pruebas
    const resetUrl = `${config.clientUrl}/auth/reset-password/${resetToken}`;

    // En desarrollo, devolvemos el token para pruebas
    return { 
        message: 'If an account with that email exists, a password reset link has been sent.',
        // Solo en modo desarrollo, incluir información para pruebas
        resetToken,
        resetUrl,
        expiresAt
    };
};

export const resetPassword = async (token: string, newPassword: string, req: Request) => {
    const { data: user, error } = await supabase
        .from('usuarios')
        .select('id, recovery_token_expires_at')
        .eq('recovery_token', token)
        .maybeSingle();

    if (error) throw new ApiError(500, 'Error validating reset token', false, error.message);
    if (!user) throw new BadRequestError('Invalid or expired password reset token');

    // Verificar si el token ha expirado
    if (!user.recovery_token_expires_at || new Date(user.recovery_token_expires_at) < new Date()) {
        // Limpiar token expirado
        await supabase.from('usuarios').update({ recovery_token: null, recovery_token_expires_at: null }).eq('id', user.id);
        throw new BadRequestError('Invalid or expired password reset token');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

    const { error: updateError } = await supabase
        .from('usuarios')
        .update({
            password_hash: newPasswordHash,
            recovery_token: null, // Limpiar token después de usarlo
            recovery_token_expires_at: null,
            // Opcional: Forzar logout de otras sesiones aquí si es necesario
        })
        .eq('id', user.id);

    if (updateError) throw new ApiError(500, 'Failed to reset password', false, updateError.message);

    await logAccessEvent(EventType.PASSWORD_RESET_SUCCESS, user.id, req);

    return { message: 'Password has been reset successfully.' };
};