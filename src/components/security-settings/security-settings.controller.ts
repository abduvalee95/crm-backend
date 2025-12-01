import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { UpdateSecuritySettingsDto } from '../../libs/dto/security-settings/update-security-settings.dto';
import { SecuritySettings } from '../../libs/entities/security-settings';
import { User } from '../../libs/entities/user';
import { CurrentUser } from '../auth/decorator/current.decorator';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { SecuritySettingsService } from './security-settings.service';

@Controller('security-settings')
@UseGuards(AuthGuard)
export class SecuritySettingsController {
  constructor(
    private readonly securitySettingsService: SecuritySettingsService,
  ) {}

  @Get()
  async getSettings(@CurrentUser() user: User): Promise<SecuritySettings> {
    return await this.securitySettingsService.getSettings(user.id);
  }

  @Put()
  async updateSettings(
    @CurrentUser() user: User,
    @Body() input: UpdateSecuritySettingsDto,
  ): Promise<SecuritySettings> {
    return await this.securitySettingsService.updateSettings(user.id, input);
  }
}
