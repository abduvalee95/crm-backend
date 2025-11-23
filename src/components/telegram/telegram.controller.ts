import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import {
  TestTelegramSettingsDto,
  UpdateTelegramSettingsDto,
} from '../../libs/dto/telegramm/update-telegram-settings.dto';
import { UserRole } from '../../libs/enums/user.enums';
import { Roles } from '../auth/decorator/roles.decorator';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { TelegramService } from './telegram.service';

@Controller('integrations/telegram')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('settings')
  async getSettings() {
    return this.telegramService.getSanitizedSettings();
  }

  @Put('settings')
  async updateSettings(@Body() body: UpdateTelegramSettingsDto) {
    return this.telegramService.updateSettings(body);
  }

  @Post('test')
  async test(@Body() body: TestTelegramSettingsDto) {
    await this.telegramService.testConnection(body);
    return { message: 'Test message was sent to Telegram chat' };
  }
}
