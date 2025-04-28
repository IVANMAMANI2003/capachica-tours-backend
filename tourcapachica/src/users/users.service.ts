import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.usuario.findMany({
      include: {
        usuariosRoles: {
          include: {
            rol: true
          }
        }
      }
    });
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
      include: {
        usuariosRoles: {
          include: {
            rol: true
          }
        }
      }
    });
  }

  async findById(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: {
        usuariosRoles: {
          include: {
            rol: true
          }
        }
      }
    });
  }

  async create(data: {
    email: string;
    password: string;
    persona_id: number;
  }) {
    const hashedPassword = await hash(data.password, 10);
    
    return this.prisma.usuario.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        personaId: data.persona_id,
      },
    });
  }

  async update(id: number, data: {
    email?: string;
    password?: string;
    esta_activo?: boolean;
  }) {
    if (data.password) {
      data.password = await hash(data.password, 10);
    }

    return this.prisma.usuario.update({
      where: { id },
      data: {
        email: data.email,
        passwordHash: data.password,
        estaActivo: data.esta_activo,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.usuario.delete({
      where: { id },
    });
  }

  async assignRole(userId: number, roleId: number) {
    return this.prisma.usuariosRoles.create({
      data: {
        usuarioId: userId,
        rolId: roleId,
      },
    });
  }

  async removeRole(userId: number, roleId: number) {
    return this.prisma.usuariosRoles.deleteMany({
      where: {
        usuarioId: userId,
        rolId: roleId,
      },
    });
  }
}
