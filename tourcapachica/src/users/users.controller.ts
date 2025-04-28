import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  create(@Body() createUserDto: { email: string; password: string; persona_id: number }) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateUserDto: { email?: string; password?: string; esta_activo?: boolean }) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.delete(+id);
  }

  @Post(':userId/roles/:roleId')
  @Roles('admin')
  assignRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.usersService.assignRole(+userId, +roleId);
  }

  @Delete(':userId/roles/:roleId')
  @Roles('admin')
  removeRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.usersService.removeRole(+userId, +roleId);
  }
}
