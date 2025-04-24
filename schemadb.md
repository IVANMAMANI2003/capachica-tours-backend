-- Schema para CapachicaTurs (Sistema de Usuarios) en Supabase
-- Con políticas RLS abiertas para gestión completa desde el backend
-- Nota: Todo el manejo de autenticación y autorización se realiza en el backend

-- La función gen_random_uuid() requiere la extensión pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertamos los roles base
INSERT INTO roles (nombre, descripcion) VALUES 
  ('cliente', 'Usuario que realiza reservas y consultas en la plataforma'),
  ('emprendedor', 'Usuario que administra un emprendimiento turístico'),
  ('admin', 'Administrador del sistema con acceso completo');

-- Tabla de permisos
CREATE TABLE permisos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertamos permisos básicos del sistema
INSERT INTO permisos (nombre, descripcion) VALUES
  ('crear_reserva', 'Puede crear reservas de paquetes turísticos'),
  ('ver_reservas_propias', 'Puede ver sus propias reservas'),
  ('gestionar_perfil', 'Puede gestionar su información personal'),
  ('gestionar_emprendimiento', 'Puede gestionar información de su emprendimiento'),
  ('publicar_contenido', 'Puede publicar contenido en el blog de emprendimientos'),
  ('ver_estadisticas_propias', 'Puede ver estadísticas de su emprendimiento'),
  ('aprobar_contenido', 'Puede aprobar el contenido publicado por emprendedores'),
  ('gestionar_usuarios', 'Puede crear, editar y suspender usuarios'),
  ('gestionar_plataforma', 'Puede modificar la configuración general de la plataforma'),
  ('ver_estadisticas_globales', 'Puede ver estadísticas generales de la plataforma');

-- Tabla de relación roles-permisos
CREATE TABLE roles_permisos (
  id SERIAL PRIMARY KEY,
  rol_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permiso_id INTEGER NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(rol_id, permiso_id)
);

-- Asignamos permisos a roles
-- Permisos para clientes
INSERT INTO roles_permisos (rol_id, permiso_id) 
SELECT r.id, p.id FROM roles r, permisos p 
WHERE r.nombre = 'cliente' AND p.nombre IN ('crear_reserva', 'ver_reservas_propias', 'gestionar_perfil');

-- Permisos para emprendedores
INSERT INTO roles_permisos (rol_id, permiso_id) 
SELECT r.id, p.id FROM roles r, permisos p 
WHERE r.nombre = 'emprendedor' AND p.nombre IN ('gestionar_perfil', 'gestionar_emprendimiento', 'publicar_contenido', 'ver_estadisticas_propias', 'ver_reservas_propias');

-- Permisos para administradores (todos los permisos)
INSERT INTO roles_permisos (rol_id, permiso_id) 
SELECT r.id, p.id FROM roles r, permisos p 
WHERE r.nombre = 'admin';

-- Tabla de personas (información personal separada de la cuenta de usuario)
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  foto_perfil_url TEXT,
  fecha_nacimiento DATE,
  subdivision_id INTEGER REFERENCES subdivisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios (sistema propio en lugar de auth.users)
-- No requiere integración con auth.users de Supabase
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  recovery_token VARCHAR(255),
  recovery_token_expires_at TIMESTAMP WITH TIME ZONE,
  email_verification_token VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  esta_activo BOOLEAN DEFAULT TRUE,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  preferencias JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para relación muchos a muchos entre usuarios y roles
CREATE TABLE usuarios_roles (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rol_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, rol_id)
);

-- Tabla para emprendimientos 
CREATE TABLE emprendimientos (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL, -- Hospedaje, Guía, Comida, Cultura, Fotografía
  direccion TEXT,
  subdivision_id INTEGER REFERENCES subdivisions(id),
  coordenadas POINT,
  contacto_telefono VARCHAR(20),
  contacto_email VARCHAR(100),
  sitio_web VARCHAR(200),
  redes_sociales JSONB,
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, aprobado, rechazado, suspendido
  fecha_aprobacion TIMESTAMP WITH TIME ZONE,
  aprobado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para registro de accesos (seguridad y auditoría)
CREATE TABLE registro_accesos (
  id SERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  tipo_evento VARCHAR(50) NOT NULL, -- login, logout, reset_password, failed_login, etc.
  detalles JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Creamos la estructura jerárquica 
-- Tabla de países
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code_iso VARCHAR(3) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de subdiviciones de los paises (estados, provincias, departamentos, etc.)
CREATE TABLE subdivisions (
    id SERIAL PRIMARY KEY,
    country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country_id, name)
);

-- Tabla para gestionar tokens invalidados (lista negra)
CREATE TABLE tokens_invalidados (
  id SERIAL PRIMARY KEY,
  token_hash VARCHAR(64) NOT NULL UNIQUE,       -- Hash del token (no el token completo por seguridad)
  usuario_id UUID NOT NULL,                     -- ID del usuario que cerró sesión
  invalidado_en TIMESTAMP WITH TIME ZONE NOT NULL, -- Cuándo se invalidó
  expira_en TIMESTAMP WITH TIME ZONE NOT NULL,  -- Cuándo expira el token
  metadata JSONB DEFAULT '{}',                  -- Datos adicionales: IP, dispositivo, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Función para actualizar el timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--

-- Aplicar triggers para todas las tablas
CREATE TRIGGER update_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_permisos_updated_at
BEFORE UPDATE ON permisos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_roles_permisos_updated_at
BEFORE UPDATE ON roles_permisos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_personas_updated_at
BEFORE UPDATE ON personas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_usuarios_roles_updated_at
BEFORE UPDATE ON usuarios_roles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_emprendimientos_updated_at
BEFORE UPDATE ON emprendimientos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_registro_accesos_updated_at
BEFORE UPDATE ON registro_accesos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_countries_updated_at
BEFORE UPDATE ON countries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subdivisions_updated_at
BEFORE UPDATE ON subdivisions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Habilitar RLS (Row Level Security) para todas las tablas
-- Aunque usamos políticas abiertas, mantenemos RLS habilitado por seguridad
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emprendimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_accesos ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subdivisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens_invalidados ENABLE ROW LEVEL SECURITY;


-- Políticas RLS abiertas para permitir gestión completa desde el backend
-- Se abre el acceso completamente ya que la autenticación y autorización 
-- ahora se manejan a nivel de la API backend

-- Políticas abiertas para todas las tablas (TODAS las operaciones)
CREATE POLICY all_access_policy ON roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY all_access_policy ON permisos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY all_access_policy ON roles_permisos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY all_access_policy ON personas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY all_access_policy ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY all_access_policy ON usuarios_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY all_access_policy ON emprendimientos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY all_access_policy ON registro_accesos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY all_access_policy ON countries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY all_access_policy ON subdivisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY all_access_policy ON tokens_invalidados FOR ALL USING (true) WITH CHECK (true);

-- Índices para optimización de consultas
CREATE INDEX idx_usuarios_persona ON usuarios(persona_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_roles_usuario ON usuarios_roles(usuario_id);
CREATE INDEX idx_usuarios_roles_rol ON usuarios_roles(rol_id);
CREATE INDEX idx_emprendimientos_usuario ON emprendimientos(usuario_id);
CREATE INDEX idx_emprendimientos_estado ON emprendimientos(estado);
CREATE INDEX idx_emprendimientos_tipo ON emprendimientos(tipo);
CREATE INDEX idx_personas_subdivision ON personas(subdivision_id);
CREATE INDEX idx_emprendimientos_subdivision ON emprendimientos(subdivision_id);
CREATE INDEX idx_subdivisions_country ON subdivisions(country_id);
CREATE INDEX idx_tokens_invalidados_usuario ON tokens_invalidados(usuario_id);
CREATE INDEX idx_tokens_invalidados_expiracion ON tokens_invalidados(expira_en);
CREATE INDEX idx_tokens_invalidados_token_hash ON tokens_invalidados(token_hash);

-- Toda la lógica de autenticación y autorización está en el backend con JWT

/*
-- Script para limpiar tokens invalidados expirados
-- Este script debe ejecutarse periódicamente (por ejemplo, cada día)
-- mediante un trabajo programado (cron job)

-- Eliminar tokens invalidados que ya han expirado manualmente
DELETE FROM tokens_invalidados 
WHERE expira_en < CURRENT_TIMESTAMP;

-- Nota: En un entorno de producción, podrías considerar crear una función
-- y programarla con pg_cron si tu proveedor de base de datos lo soporta:


-- Requiere la extensión pg_cron (disponible en PostgreSQL)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Crear una función para la limpieza
CREATE OR REPLACE FUNCTION cleanup_invalidated_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM tokens_invalidados WHERE expira_en < CURRENT_TIMESTAMP;
    
    -- Opcional: registrar la operación
    INSERT INTO registro_accesos (
        usuario_id, tipo_evento, detalles
    ) VALUES (
        NULL, 'TOKENS_CLEANUP', 
        jsonb_build_object('tokens_eliminados', (SELECT count(*) FROM tokens_invalidados WHERE expira_en < CURRENT_TIMESTAMP), 'ejecutado_en', CURRENT_TIMESTAMP)
    );
END;
$$ LANGUAGE plpgsql;

-- Programar la ejecución diaria a las 3 AM
SELECT cron.schedule('0 3 * * *', 'SELECT cleanup_invalidated_tokens()');
*/ 