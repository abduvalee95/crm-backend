import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/decorator/roles.decorator';
import { UserRole } from '../../libs/enums/user.enums';
import { RoleInfo } from './access-control.service';

@Controller('access-control')
@UseGuards(AuthGuard)
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @Get('roles')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getRoles(): Promise<RoleInfo[]> {
    return this.accessControlService.getRoles();
  }

  @Get('roles/:role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getRoleInfo(@Param('role') role: string): Promise<RoleInfo | null> {
    const roleEnum = role as UserRole;
    return this.accessControlService.getRoleInfo(roleEnum) || null;
  }
}

