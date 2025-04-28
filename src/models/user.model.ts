import { Prisma, User as PrismaUser } from '@prisma/client';

export interface User extends PrismaUser {}

export interface CreateUserInput {
  personaId: number;
  email: string;
  passwordHash: string;
  recoveryToken?: string;
  recoveryTokenExpiresAt?: Date;
  emailVerificationToken?: string;
  emailVerified?: boolean;
  estaActivo?: boolean;
  ultimoAcceso?: Date;
  preferencias?: Prisma.JsonValue;
}

export interface UpdateUserInput {
  email?: string;
  passwordHash?: string;
  recoveryToken?: string;
  recoveryTokenExpiresAt?: Date;
  emailVerificationToken?: string;
  emailVerified?: boolean;
  estaActivo?: boolean;
  ultimoAcceso?: Date;
  preferencias?: Prisma.JsonValue;
}

export interface UserFilter {
  id?: number;
  personaId?: number;
  email?: string;
  emailVerified?: boolean;
  estaActivo?: boolean;
} 