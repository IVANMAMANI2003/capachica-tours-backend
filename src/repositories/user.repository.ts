import prisma from '../config/prisma';
import { User, CreateUserInput, UpdateUserInput, UserFilter } from '../models/user.model';

export class UserRepository {
  async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        persona: true,
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        persona: true,
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });
  }

  async findAll(filter?: UserFilter): Promise<User[]> {
    return prisma.user.findMany({
      where: filter,
      include: {
        persona: true,
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });
  }

  async update(id: number, data: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  async addRole(userId: number, roleId: number): Promise<void> {
    await prisma.userRole.create({
      data: {
        usuarioId: userId,
        rolId: roleId,
      },
    });
  }

  async removeRole(userId: number, roleId: number): Promise<void> {
    await prisma.userRole.deleteMany({
      where: {
        usuarioId: userId,
        rolId: roleId,
      },
    });
  }
} 