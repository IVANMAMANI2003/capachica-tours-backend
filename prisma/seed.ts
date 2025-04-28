import { PrismaClient } from '../src/generated/prisma'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  try {
    // 1. Crear roles básicos
    const roles = await prisma.role.createMany({
      data: [
        {
          nombre: 'superadmin',
          descripcion: 'Super Administrador del sistema con acceso total'
        },
        {
          nombre: 'admin',
          descripcion: 'Administrador con accesos limitados'
        },
        {
          nombre: 'emprendedor',
          descripcion: 'Usuario emprendedor que puede gestionar sus emprendimientos'
        },
        {
          nombre: 'usuario',
          descripcion: 'Usuario regular del sistema'
        }
      ],
      skipDuplicates: true
    })

    console.log('✅ Roles creados')

    // 2. Crear permisos básicos del sistema
    const permisos = await prisma.permiso.createMany({
      data: [
        { nombre: 'users.create', descripcion: 'Crear usuarios' },
        { nombre: 'users.read', descripcion: 'Ver usuarios' },
        { nombre: 'users.update', descripcion: 'Actualizar usuarios' },
        { nombre: 'users.delete', descripcion: 'Eliminar usuarios' },
        { nombre: 'roles.manage', descripcion: 'Gestionar roles' },
        { nombre: 'permissions.manage', descripcion: 'Gestionar permisos' },
        { nombre: 'emprendimientos.create', descripcion: 'Crear emprendimientos' },
        { nombre: 'emprendimientos.read', descripcion: 'Ver emprendimientos' },
        { nombre: 'emprendimientos.update', descripcion: 'Actualizar emprendimientos' },
        { nombre: 'emprendimientos.delete', descripcion: 'Eliminar emprendimientos' },
        { nombre: 'reservas.manage', descripcion: 'Gestionar reservas' },
        { nombre: 'pagos.manage', descripcion: 'Gestionar pagos' }
      ],
      skipDuplicates: true
    })

    console.log('✅ Permisos creados')

    // 3. Obtener el rol de superadmin
    const superadminRole = await prisma.role.findUnique({
      where: { nombre: 'superadmin' }
    })

    if (!superadminRole) {
      throw new Error('Rol superadmin no encontrado')
    }

    // 4. Asignar todos los permisos al rol superadmin
    const allPermisos = await prisma.permiso.findMany()
    
    for (const permiso of allPermisos) {
      await prisma.rolesPermisos.create({
        data: {
          rolId: superadminRole.id,
          permisoId: permiso.id
        }
      })
    }

    console.log('✅ Permisos asignados al rol superadmin')

    // 5. Crear país y subdivisión por defecto
    const country = await prisma.country.create({
      data: {
        name: 'Perú',
        codeIso: 'PER',
        subdivisions: {
          create: [
            { name: 'Puno' },
            { name: 'Lima' },
            { name: 'Arequipa' },
            { name: 'Cusco' }
          ]
        }
      },
      include: {
        subdivisions: true
      }
    })

    console.log('✅ País y subdivisiones creadas')

    // 6. Crear persona para el superadmin
    const persona = await prisma.persona.create({
      data: {
        nombre: 'Super',
        apellidos: 'Admin',
        telefono: '123456789',
        direccion: 'Dirección Administrativa',
        subdivisionId: country.subdivisions[0].id // Usando Puno como default
      }
    })

    console.log('✅ Persona creada para el superadmin')

    // 7. Crear usuario superadmin
    const hashedPassword = await bcrypt.hash('superadmin123', 10)
    const superAdmin = await prisma.usuario.create({
      data: {
        email: 'superadmin@capachica.com',
        passwordHash: hashedPassword,
        personaId: persona.id,
        emailVerified: true,
        estaActivo: true,
        usuariosRoles: {
          create: {
            rolId: superadminRole.id
          }
        }
      }
    })

    console.log('✅ Usuario superadmin creado exitosamente')
    console.log('Email:', superAdmin.email)
    console.log('Contraseña:', 'superadmin123')

  } catch (error) {
    console.error('Error durante el seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Error en el proceso de seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })