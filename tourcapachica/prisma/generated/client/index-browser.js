
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  nombre: 'nombre',
  descripcion: 'descripcion',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PermisoScalarFieldEnum = {
  id: 'id',
  nombre: 'nombre',
  descripcion: 'descripcion',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RolesPermisosScalarFieldEnum = {
  id: 'id',
  rolId: 'rolId',
  permisoId: 'permisoId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CountryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  codeIso: 'codeIso',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubdivisionScalarFieldEnum = {
  id: 'id',
  countryId: 'countryId',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PersonaScalarFieldEnum = {
  id: 'id',
  nombre: 'nombre',
  apellidos: 'apellidos',
  telefono: 'telefono',
  direccion: 'direccion',
  fotoPerfilUrl: 'fotoPerfilUrl',
  fechaNacimiento: 'fechaNacimiento',
  subdivisionId: 'subdivisionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UsuarioScalarFieldEnum = {
  id: 'id',
  personaId: 'personaId',
  email: 'email',
  passwordHash: 'passwordHash',
  recoveryToken: 'recoveryToken',
  recoveryTokenExpiresAt: 'recoveryTokenExpiresAt',
  emailVerificationToken: 'emailVerificationToken',
  emailVerified: 'emailVerified',
  estaActivo: 'estaActivo',
  ultimoAcceso: 'ultimoAcceso',
  preferencias: 'preferencias',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UsuariosRolesScalarFieldEnum = {
  id: 'id',
  rolId: 'rolId',
  usuarioId: 'usuarioId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmprendimientoScalarFieldEnum = {
  id: 'id',
  usuarioId: 'usuarioId',
  nombre: 'nombre',
  descripcion: 'descripcion',
  tipo: 'tipo',
  direccion: 'direccion',
  subdivisionId: 'subdivisionId',
  coordenadas: 'coordenadas',
  contactoTelefono: 'contactoTelefono',
  contactoEmail: 'contactoEmail',
  sitioWeb: 'sitioWeb',
  redesSociales: 'redesSociales',
  estado: 'estado',
  fechaAprobacion: 'fechaAprobacion',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RegistroAccesoScalarFieldEnum = {
  id: 'id',
  usuarioId: 'usuarioId',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  tipoEvento: 'tipoEvento',
  detalles: 'detalles',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TokenInvalidadoScalarFieldEnum = {
  id: 'id',
  tokenHash: 'tokenHash',
  usuarioId: 'usuarioId',
  invalidadoEn: 'invalidadoEn',
  expiraEn: 'expiraEn',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.TuristaScalarFieldEnum = {
  id: 'id',
  nombre: 'nombre',
  apellidos: 'apellidos',
  telefono: 'telefono',
  direccion: 'direccion',
  edad: 'edad',
  sexo: 'sexo',
  pais: 'pais',
  peticionesEspeciales: 'peticionesEspeciales',
  email: 'email',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LugarTuristicoScalarFieldEnum = {
  id: 'id',
  nombre: 'nombre',
  descripcion: 'descripcion',
  direccion: 'direccion',
  coordenadas: 'coordenadas',
  horarioApertura: 'horarioApertura',
  horarioCierre: 'horarioCierre',
  costoEntrada: 'costoEntrada',
  recomendaciones: 'recomendaciones',
  restricciones: 'restricciones',
  esDestacado: 'esDestacado',
  estado: 'estado',
  imagenUrl: 'imagenUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ServicioEmprendedorScalarFieldEnum = {
  id: 'id',
  servicioId: 'servicioId',
  emprendimientoId: 'emprendimientoId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ServicioScalarFieldEnum = {
  id: 'id',
  tipoServicioId: 'tipoServicioId',
  nombre: 'nombre',
  descripcion: 'descripcion',
  precioBase: 'precioBase',
  moneda: 'moneda',
  estado: 'estado',
  imagenUrl: 'imagenUrl',
  detallesServicio: 'detallesServicio',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaqueteTuristicoServicioScalarFieldEnum = {
  id: 'id',
  servicioId: 'servicioId',
  paqueteTuristicoId: 'paqueteTuristicoId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaqueteTuristicoScalarFieldEnum = {
  id: 'id',
  emprendimientoId: 'emprendimientoId',
  nombre: 'nombre',
  descripcion: 'descripcion',
  duracionDias: 'duracionDias',
  duracionNoches: 'duracionNoches',
  precioPorPersona: 'precioPorPersona',
  moneda: 'moneda',
  capacidadMaxima: 'capacidadMaxima',
  fechaInicio: 'fechaInicio',
  fechaFin: 'fechaFin',
  lugaresVisitados: 'lugaresVisitados',
  requisitos: 'requisitos',
  incluye: 'incluye',
  noIncluye: 'noIncluye',
  estado: 'estado',
  esPersonalizable: 'esPersonalizable',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DisponibilidadPaqueteScalarFieldEnum = {
  id: 'id',
  paqueteId: 'paqueteId',
  fechaInicio: 'fechaInicio',
  fechaFin: 'fechaFin',
  cuposDisponibles: 'cuposDisponibles',
  precioEspecial: 'precioEspecial',
  notas: 'notas',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TipoServicioScalarFieldEnum = {
  id: 'id',
  nombre: 'nombre',
  descripcion: 'descripcion',
  imagenUrl: 'imagenUrl',
  requiereCupo: 'requiereCupo',
  createdAt: 'createdAt'
};

exports.Prisma.ServicioDisponibilidadScalarFieldEnum = {
  id: 'id',
  servicioId: 'servicioId',
  fecha: 'fecha',
  cuposDisponibles: 'cuposDisponibles',
  precioEspecial: 'precioEspecial'
};

exports.Prisma.ResenaScalarFieldEnum = {
  id: 'id',
  usuarioId: 'usuarioId',
  tipoObjeto: 'tipoObjeto',
  calificacion: 'calificacion',
  comentario: 'comentario',
  fechaExperiencia: 'fechaExperiencia',
  respuestaOwner: 'respuestaOwner',
  fechaRespuesta: 'fechaRespuesta',
  estado: 'estado',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FavoritoScalarFieldEnum = {
  id: 'id',
  estado: 'estado',
  usuarioId: 'usuarioId',
  emprendimientoId: 'emprendimientoId',
  createdAt: 'createdAt'
};

exports.Prisma.ReservaScalarFieldEnum = {
  id: 'id',
  codigoReserva: 'codigoReserva',
  turistaId: 'turistaId',
  tipoReserva: 'tipoReserva',
  fechaReserva: 'fechaReserva',
  fechaInicio: 'fechaInicio',
  hora: 'hora',
  fechaFin: 'fechaFin',
  cantidadPersonas: 'cantidadPersonas',
  precioTotal: 'precioTotal',
  moneda: 'moneda',
  estado: 'estado',
  metodoPago: 'metodoPago',
  datosPago: 'datosPago',
  notas: 'notas',
  motivoCancelacion: 'motivoCancelacion',
  fechaCancelacion: 'fechaCancelacion',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ItinerarioReservaScalarFieldEnum = {
  id: 'id',
  fecha: 'fecha',
  hora: 'hora',
  tipoEvento: 'tipoEvento',
  descripcion: 'descripcion',
  notas: 'notas',
  duracion: 'duracion',
  reservaId: 'reservaId',
  servicioId: 'servicioId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ItinerarioLugarScalarFieldEnum = {
  id: 'id',
  itinerarioReservaId: 'itinerarioReservaId',
  lugarTuristicoId: 'lugarTuristicoId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PagoScalarFieldEnum = {
  id: 'id',
  reservaId: 'reservaId',
  codigoTransaccion: 'codigoTransaccion',
  montoTotal: 'montoTotal',
  moneda: 'moneda',
  estado: 'estado',
  fechaPago: 'fechaPago',
  datosMetodoPago: 'datosMetodoPago',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PagoDetalleScalarFieldEnum = {
  id: 'id',
  pagoId: 'pagoId',
  tipoPagoId: 'tipoPagoId',
  concepto: 'concepto',
  monto: 'monto',
  porcentajeImpuesto: 'porcentajeImpuesto',
  cantidad: 'cantidad',
  descripcion: 'descripcion',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TipoPagoScalarFieldEnum = {
  id: 'id',
  nombre: 'nombre',
  descripcion: 'descripcion',
  requiereVerificacion: 'requiereVerificacion',
  comisionPorcentaje: 'comisionPorcentaje',
  activo: 'activo',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ComprobanteScalarFieldEnum = {
  id: 'id',
  pagoId: 'pagoId',
  tipoComprobante: 'tipoComprobante',
  serie: 'serie',
  numero: 'numero',
  fechaEmision: 'fechaEmision',
  rucCliente: 'rucCliente',
  razonSocial: 'razonSocial',
  direccionCliente: 'direccionCliente',
  subtotal: 'subtotal',
  igv: 'igv',
  total: 'total',
  moneda: 'moneda',
  estado: 'estado',
  codigoSunat: 'codigoSunat',
  codigoHash: 'codigoHash',
  xmlUrl: 'xmlUrl',
  pdfUrl: 'pdfUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};


exports.Prisma.ModelName = {
  Role: 'Role',
  Permiso: 'Permiso',
  RolesPermisos: 'RolesPermisos',
  Country: 'Country',
  Subdivision: 'Subdivision',
  Persona: 'Persona',
  Usuario: 'Usuario',
  UsuariosRoles: 'UsuariosRoles',
  Emprendimiento: 'Emprendimiento',
  RegistroAcceso: 'RegistroAcceso',
  TokenInvalidado: 'TokenInvalidado',
  Turista: 'Turista',
  LugarTuristico: 'LugarTuristico',
  ServicioEmprendedor: 'ServicioEmprendedor',
  Servicio: 'Servicio',
  PaqueteTuristicoServicio: 'PaqueteTuristicoServicio',
  PaqueteTuristico: 'PaqueteTuristico',
  DisponibilidadPaquete: 'DisponibilidadPaquete',
  TipoServicio: 'TipoServicio',
  ServicioDisponibilidad: 'ServicioDisponibilidad',
  Resena: 'Resena',
  Favorito: 'Favorito',
  Reserva: 'Reserva',
  ItinerarioReserva: 'ItinerarioReserva',
  ItinerarioLugar: 'ItinerarioLugar',
  Pago: 'Pago',
  PagoDetalle: 'PagoDetalle',
  TipoPago: 'TipoPago',
  Comprobante: 'Comprobante'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
