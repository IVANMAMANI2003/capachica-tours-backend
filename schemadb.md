CREATE TABLE "roles" (
  "id" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(50) UNIQUE NOT NULL,
  "descripcion" TEXT,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "permisos" (
  "id" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(100) UNIQUE NOT NULL,
  "descripcion" TEXT,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "roles_permisos" (
  "id" SERIAL PRIMARY KEY,
  "rol_id" SERIAL NOT NULL,
  "permiso_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "countries" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) UNIQUE NOT NULL,
  "code_iso" VARCHAR(3) UNIQUE NOT NULL,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "subdivisions" (
  "id" SERIAL PRIMARY KEY,
  "country_id" SERIAL NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "personas" (
  "id" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(100) NOT NULL,
  "apellidos" VARCHAR(100) NOT NULL,
  "telefono" VARCHAR(20),
  "direccion" TEXT,
  "foto_perfil_url" TEXT,
  "fecha_nacimiento" DATE,
  "subdivision_id" SERIAL,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "usuarios" (
  "id" SERIAL PRIMARY KEY,
  "persona_id" SERIAL NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "recovery_token" VARCHAR(255),
  "recovery_token_expires_at" TIMESTAMP,
  "email_verification_token" VARCHAR(255),
  "email_verified" BOOLEAN DEFAULT false,
  "esta_activo" BOOLEAN DEFAULT true,
  "ultimo_acceso" TIMESTAMP,
  "preferencias" JSONB DEFAULT '{}',
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "usuarios_roles" (
  "id" SERIAL PRIMARY KEY,
  "rol_id" SERIAL NOT NULL,
  "usuario_id" SERIAL NOT NULL,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "emprendimientos" (
  "id" SERIAL PRIMARY KEY,
  "usuario_id" SERIAL NOT NULL,
  "nombre" VARCHAR(200) NOT NULL,
  "descripcion" TEXT,
  "tipo" VARCHAR(50) NOT NULL,
  "direccion" TEXT,
  "subdivision_id" INTEGER,
  "coordenadas" POINT,
  "contacto_telefono" VARCHAR(20),
  "contacto_email" VARCHAR(100),
  "sitio_web" VARCHAR(200),
  "redes_sociales" JSONB,
  "estado" VARCHAR(20) DEFAULT 'pendiente',
  "fecha_aprobacion" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "registro_accesos" (
  "id" SERIAL PRIMARY KEY,
  "usuario_id" SERIAL NOT NULL,
  "ip_address" VARCHAR(50) NOT NULL,
  "user_agent" TEXT NOT NULL,
  "tipo_evento" VARCHAR(50) NOT NULL,
  "detalles" JSONB,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "tokens_invalidados" (
  "id" SERIAL PRIMARY KEY,
  "token_hash" VARCHAR(64) UNIQUE NOT NULL,
  "usuario_id" SERIAL NOT NULL,
  "invalidado_en" TIMESTAMP NOT NULL,
  "expira_en" TIMESTAMP NOT NULL,
  "metadata" JSONB DEFAULT '{}',
  "created_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "turista" (
  "id" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(100) NOT NULL,
  "apellidos" VARCHAR(100) NOT NULL,
  "telefono" VARCHAR(20) NOT NULL,
  "direccion" TEXT NOT NULL,
  "edad" NUMERIC NOT NULL,
  "sexo" VARCHAR(20) NOT NULL,
  "pais" TEXT NOT NULL,
  "peticiones_espciales" TEXT,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "lugares_turisticos" (
  "id" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(200) NOT NULL,
  "descripcion" TEXT NOT NULL,
  "direccion" TEXT NOT NULL,
  "coordenadas" POINT NOT NULL,
  "horario_apertura" TIME,
  "horario_cierre" TIME,
  "costo_entrada" DECIMAL(10,2),
  "recomendaciones" TEXT,
  "restricciones" TEXT,
  "es_destacado" BOOLEAN DEFAULT false,
  "estado" VARCHAR(20) DEFAULT 'activo',
  "imagen_url" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "itinerario_lugares" (
  "id" SERIAL PRIMARY KEY,
  "itinerrarios_reserva_id" SERIAL,
  "lugares_turisticos_id" SERIAL,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "servicios_emprendedores" (
  "id" SERIAL PRIMARY KEY,
  "servicios_id" SERIAL NOT NULL,
  "emprendimiento_id" SERIAL NOT NULL,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "servicios" (
  "id" SERIAL PRIMARY KEY,
  "emprendimiento_id" INTEGER NOT NULL,
  "tipo_servicio_id" INTEGER NOT NULL,
  "nombre" VARCHAR(200) NOT NULL,
  "descripcion" TEXT,
  "precio_base" DECIMAL(10,2) NOT NULL,
  "moneda" VARCHAR(3) DEFAULT 'PEN',
  "estado" VARCHAR(20) DEFAULT 'activo',
  "imagen_url" TEXT NOT NULL,
  "detalles_servicio" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "paquetes_turisticos_servicios" (
  "id" SERIAL PRIMARY KEY,
  "servicios_id" SERIAL NOT NULL,
  "paquetes_turisticos_id" SERIAL NOT NULL,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "paquetes_turisticos" (
  "id" SERIAL PRIMARY KEY,
  "emprendimiento_id" SERIAL,
  "nombre" VARCHAR(200) NOT NULL,
  "descripcion" TEXT NOT NULL,
  "duracion_dias" INTEGER NOT NULL,
  "duracion_noches" INTEGER,
  "precio_por_persona" DECIMAL(10,2) NOT NULL,
  "moneda" VARCHAR(3) DEFAULT 'PEN',
  "capacidad_maxima" INTEGER,
  "fecha_inicio" DATE,
  "fecha_fin" DATE,
  "lugares_visitados" JSONB,
  "requisitos" TEXT,
  "incluye" TEXT,
  "no_incluye" TEXT,
  "estado" VARCHAR(20) DEFAULT 'activo',
  "es_personalizable" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "disponibilidad_paquetes" (
  "id" SERIAL PRIMARY KEY,
  "paquete_id" SERIAL NOT NULL,
  "fecha_inicio" DATE NOT NULL,
  "fecha_fin" DATE NOT NULL,
  "cupos_disponibles" INTEGER NOT NULL,
  "precio_especial" DECIMAL(10,2),
  "notas" TEXT,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "tipos_servicio" (
  "id" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(100) NOT NULL,
  "descripcion" TEXT,
  "imagen_url" TEXT NOT NULL,
  "requiere_cupo" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "servicios_disponibilidad" (
  "id" SERIAL PRIMARY KEY,
  "servicio_id" INTEGER NOT NULL,
  "fecha" DATE NOT NULL,
  "cupos_disponibles" INTEGER NOT NULL,
  "precio_especial" DECIMAL(10,2)
);

CREATE TABLE "reseñas" (
  "id" SERIAL PRIMARY KEY,
  "usuario_id" SERIAL NOT NULL,
  "tipo_objeto" VARCHAR(50) NOT NULL,
  "calificacion" INTEGER NOT NULL,
  "comentario" TEXT,
  "fecha_experiencia" DATE,
  "respuesta_owner" TEXT,
  "fecha_respuesta" TIMESTAMP,
  "estado" VARCHAR(20) DEFAULT 'pendiente',
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "favoritos" (
  "id" SERIAL PRIMARY KEY,
  "estado" VARCHAR(20) DEFAULT 'pendiente',
  "usuario_id" SERIAL NOT NULL,
  "emprendimiento_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "reservas" (
  "id" SERIAL PRIMARY KEY,
  "codigo_reserva" VARCHAR(20) UNIQUE NOT NULL,
  "turista_id" SERIAL NOT NULL,
  "tipo_reserva" VARCHAR(50) NOT NULL,
  "fecha_reserva" TIMESTAMP DEFAULT (now()),
  "fecha_inicio" DATE NOT NULL,
  "hora" VARCHAR(50),
  "fecha_fin" DATE,
  "cantidad_personas" INTEGER DEFAULT 1,
  "precio_total" DECIMAL(10,2) NOT NULL,
  "moneda" VARCHAR(3) DEFAULT 'PEN',
  "estado" VARCHAR(20) DEFAULT 'pendiente',
  "metodo_pago" VARCHAR(50),
  "datos_pago" JSONB,
  "notas" TEXT,
  "motivo_cancelacion" TEXT,
  "fecha_cancelacion" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "itinerarios_reserva" (
  "id" SERIAL PRIMARY KEY,
  "fecha" DATE NOT NULL,
  "hora" TIME,
  "tipo_evento" VARCHAR(100) NOT NULL,
  "descripcion" TEXT NOT NULL,
  "notas" TEXT,
  "duracion" integer,
  "reserva_id" SERIAL NOT NULL,
  "servicio_id" SERIAL,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "pago" (
  "id" SERIAL PRIMARY KEY,
  "reserva_id" SERIAL NOT NULL,
  "codigo_transaccion" VARCHAR(100) UNIQUE,
  "monto_total" DECIMAL(12,2) NOT NULL,
  "moneda" VARCHAR(3) DEFAULT 'PEN',
  "estado" VARCHAR(20) DEFAULT 'pendiente',
  "fecha_pago" TIMESTAMP,
  "datos_metodo_pago" JSONB,
  "metadata" JSONB DEFAULT '{}',
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "pago_detalle" (
  "id" SERIAL PRIMARY KEY,
  "pago_id" SERIAL NOT NULL,
  "tipo_pago_id" SERIAL NOT NULL,
  "concepto" VARCHAR(100) NOT NULL,
  "monto" DECIMAL(12,2) NOT NULL,
  "porcentaje_impuesto" DECIMAL(5,2) DEFAULT 0,
  "cantidad" INTEGER DEFAULT 1,
  "descripcion" TEXT,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "tipo_pago" (
  "id" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(50) UNIQUE NOT NULL,
  "descripcion" TEXT,
  "requiere_verificacion" BOOLEAN DEFAULT false,
  "comision_porcentaje" DECIMAL(5,2) DEFAULT 0,
  "activo" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "comprobantes" (
  "id" SERIAL PRIMARY KEY,
  "pago_id" SERIAL NOT NULL,
  "tipo_comprobante" VARCHAR(20) NOT NULL,
  "serie" VARCHAR(4) NOT NULL,
  "numero" INTEGER NOT NULL,
  "fecha_emision" TIMESTAMP NOT NULL DEFAULT (now()),
  "ruc_cliente" VARCHAR(11),
  "razon_social" VARCHAR(100),
  "direccion_cliente" TEXT,
  "subtotal" DECIMAL(12,2) NOT NULL,
  "igv" DECIMAL(12,2) DEFAULT 0,
  "total" DECIMAL(12,2) NOT NULL,
  "moneda" VARCHAR(3) DEFAULT 'PEN',
  "estado" VARCHAR(20) DEFAULT 'emitido',
  "codigo_sunat" VARCHAR(100),
  "codigo_hash" VARCHAR(100),
  "xml_url" TEXT,
  "pdf_url" TEXT,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE UNIQUE INDEX ON "roles_permisos" ("rol_id", "permiso_id");

CREATE UNIQUE INDEX ON "subdivisions" ("country_id", "name");

CREATE UNIQUE INDEX ON "usuarios_roles" ("usuario_id", "rol_id");

CREATE INDEX ON "servicios" ("emprendimiento_id", "tipo_servicio_id");

CREATE UNIQUE INDEX ON "disponibilidad_paquetes" ("paquete_id", "fecha_inicio", "fecha_fin");

CREATE UNIQUE INDEX ON "servicios_disponibilidad" ("servicio_id", "fecha");

CREATE UNIQUE INDEX ON "favoritos" ("emprendimiento_id", "usuario_id");

CREATE INDEX "idx_pagos_reserva" ON "pago" ("reserva_id");

CREATE INDEX "idx_pagos_transaccion" ON "pago" ("codigo_transaccion");

CREATE INDEX "idx_pagos_estado" ON "pago" ("estado");

CREATE INDEX "idx_detalles_pago" ON "pago_detalle" ("pago_id");

CREATE UNIQUE INDEX ON "comprobantes" ("serie", "numero");

CREATE UNIQUE INDEX ON "comprobantes" ("pago_id");

ALTER TABLE "roles_permisos" ADD FOREIGN KEY ("rol_id") REFERENCES "roles" ("id") ON DELETE CASCADE;

ALTER TABLE "roles_permisos" ADD FOREIGN KEY ("permiso_id") REFERENCES "permisos" ("id") ON DELETE CASCADE;

ALTER TABLE "subdivisions" ADD FOREIGN KEY ("country_id") REFERENCES "countries" ("id") ON DELETE CASCADE;

ALTER TABLE "personas" ADD FOREIGN KEY ("subdivision_id") REFERENCES "subdivisions" ("id");

ALTER TABLE "usuarios" ADD FOREIGN KEY ("persona_id") REFERENCES "personas" ("id") ON DELETE CASCADE;

ALTER TABLE "usuarios_roles" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE;

ALTER TABLE "usuarios_roles" ADD FOREIGN KEY ("rol_id") REFERENCES "roles" ("id") ON DELETE CASCADE;

ALTER TABLE "emprendimientos" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE;

ALTER TABLE "emprendimientos" ADD FOREIGN KEY ("subdivision_id") REFERENCES "subdivisions" ("id");

ALTER TABLE "registro_accesos" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL;

ALTER TABLE "tokens_invalidados" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id");

ALTER TABLE "servicios_emprendedores" ADD FOREIGN KEY ("emprendimiento_id") REFERENCES "emprendimientos" ("id") ON DELETE CASCADE;

ALTER TABLE "servicios_emprendedores" ADD FOREIGN KEY ("servicios_id") REFERENCES "servicios" ("id") ON DELETE CASCADE;

ALTER TABLE "paquetes_turisticos" ADD FOREIGN KEY ("emprendimiento_id") REFERENCES "emprendimientos" ("id") ON DELETE SET NULL;

ALTER TABLE "paquetes_turisticos_servicios" ADD FOREIGN KEY ("paquetes_turisticos_id") REFERENCES "paquetes_turisticos" ("id") ON DELETE SET NULL;

ALTER TABLE "paquetes_turisticos_servicios" ADD FOREIGN KEY ("servicios_id") REFERENCES "servicios" ("id") ON DELETE SET NULL;

ALTER TABLE "disponibilidad_paquetes" ADD FOREIGN KEY ("paquete_id") REFERENCES "paquetes_turisticos" ("id") ON DELETE CASCADE;

ALTER TABLE "reseñas" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE;

ALTER TABLE "favoritos" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE;

ALTER TABLE "favoritos" ADD FOREIGN KEY ("emprendimiento_id") REFERENCES "emprendimientos" ("id") ON DELETE CASCADE;

ALTER TABLE "reservas" ADD FOREIGN KEY ("turista_id") REFERENCES "turista" ("id") ON DELETE CASCADE;

ALTER TABLE "itinerarios_reserva" ADD FOREIGN KEY ("reserva_id") REFERENCES "reservas" ("id") ON DELETE CASCADE;

ALTER TABLE "itinerarios_reserva" ADD FOREIGN KEY ("servicio_id") REFERENCES "servicios" ("id");

ALTER TABLE "pago_detalle" ADD FOREIGN KEY ("tipo_pago_id") REFERENCES "tipo_pago" ("id");

ALTER TABLE "pago_detalle" ADD FOREIGN KEY ("pago_id") REFERENCES "pago" ("id");

ALTER TABLE "pago" ADD FOREIGN KEY ("reserva_id") REFERENCES "reservas" ("id");

ALTER TABLE "itinerario_lugares" ADD FOREIGN KEY ("itinerrarios_reserva_id") REFERENCES "itinerarios_reserva" ("id");

ALTER TABLE "itinerario_lugares" ADD FOREIGN KEY ("lugares_turisticos_id") REFERENCES "lugares_turisticos" ("id");

ALTER TABLE "comprobantes" ADD FOREIGN KEY ("pago_id") REFERENCES "pago" ("id");

ALTER TABLE "servicios" ADD FOREIGN KEY ("tipo_servicio_id") REFERENCES "tipos_servicio" ("id");

ALTER TABLE "servicios_disponibilidad" ADD FOREIGN KEY ("servicio_id") REFERENCES "servicios" ("id") ON DELETE CASCADE;
