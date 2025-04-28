import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Eliminar datos existentes
  await prisma.usuariosRoles.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.persona.deleteMany();
  await prisma.subdivision.deleteMany();
  await prisma.country.deleteMany();
  await prisma.role.deleteMany();

  // Crear rol de administrador
  const adminRole = await prisma.role.create({
    data: {
      nombre: 'admin',
      descripcion: 'Administrador del sistema',
    },
  });

  // Crear país
  const country = await prisma.country.create({
    data: {
      name: 'Perú',
      codeIso: 'PE',
    },
  });

  // Crear subdivisión
  const subdivision = await prisma.subdivision.create({
    data: {
      name: 'Puno',
      countryId: country.id,
    },
  });

  // Crear persona
  const persona = await prisma.persona.create({
    data: {
      nombre: 'Admin',
      apellidos: 'Sistema',
      telefono: '000000000',
      direccion: 'Sistema',
      subdivisionId: subdivision.id,
    },
  });

  // Crear usuario administrador
  const hashedPassword = await hash('admin123', 10);
  const adminUser = await prisma.usuario.create({
    data: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      personaId: persona.id,
      estaActivo: true,
    },
  });

  // Asignar rol de administrador al usuario
  await prisma.usuariosRoles.create({
    data: {
      usuarioId: adminUser.id,
      rolId: adminRole.id,
    },
  });

  console.log('Usuario administrador creado exitosamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 