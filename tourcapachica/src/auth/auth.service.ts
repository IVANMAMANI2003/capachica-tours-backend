import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      roles: user.usuariosRoles?.map(ur => ur.rol.nombre) || [] 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        roles: user.usuariosRoles?.map(ur => ur.rol.nombre) || []
      }
    };
  }

  async refreshToken(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      roles: user.usuariosRoles?.map(ur => ur.rol.nombre) || [] 
    };
    
    return {
      access_token: this.jwtService.sign(payload)
    };
  }
}
