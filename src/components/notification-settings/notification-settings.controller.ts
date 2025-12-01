import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { UpdateNotificationSettingsDto } from '../../libs/dto/notification-settings/update-notification-settings.dto';
import { NotificationSettings } from '../../libs/entities/notification-settings';
import { User } from '../../libs/entities/user';
import { CurrentUser } from '../auth/decorator/current.decorator';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationSettingsService } from './notification-settings.service';

@Controller('notification-settings')
@UseGuards(AuthGuard)
export class NotificationSettingsController {
  constructor(
    private readonly notificationSettingsService: NotificationSettingsService,
  ) {}

  @Get()
  async getSettings(@CurrentUser() user: User): Promise<NotificationSettings> {
    return await this.notificationSettingsService.getSettings(user.id);
  }

  @Put()
  async updateSettings(
    @CurrentUser() user: User,
    @Body() input: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettings> {
    return await this.notificationSettingsService.updateSettings(
      user.id,
      input,
    );
  }
}
