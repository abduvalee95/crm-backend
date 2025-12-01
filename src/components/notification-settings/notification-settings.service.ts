import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateNotificationSettingsDto } from '../../libs/dto/notification-settings/update-notification-settings.dto';
import { NotificationSettings } from '../../libs/entities/notification-settings';
import { NotificationCategory } from '../../libs/enums/notification-category.enum';
import { NotificationChannel } from '../../libs/enums/notification-channel.enum';
import { NotificationFrequency } from '../../libs/enums/notification-frequency.enum';

@Injectable()
export class NotificationSettingsService {
  constructor(
    @InjectRepository(NotificationSettings)
    private notificationSettingsRepository: Repository<NotificationSettings>,
  ) {}

  async getSettings(userId: string): Promise<NotificationSettings> {
    let settings = await this.notificationSettingsRepository.findOne({
      where: { userId },
    });

    // Agar settings yo'q bo'lsa, default settings yaratamiz
    if (!settings) {
      settings = await this.createDefaultSettings(userId);
    }

    return settings;
  }

  async updateSettings(
    userId: string,
    input: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettings> {
    let settings = await this.notificationSettingsRepository.findOne({
      where: { userId },
    });

    // Agar settings yo'q bo'lsa, default settings yaratamiz
    if (!settings) {
      settings = await this.createDefaultSettings(userId);
    }

    // Channels ni yangilash
    if (input.channels) {
      settings.channels = {
        ...settings.channels,
        ...input.channels,
      };
    }

    // Categories ni yangilash
    if (input.categories) {
      settings.categories = {
        ...settings.categories,
        ...input.categories,
      };
    }

    // Frequency ni yangilash
    if (input.frequency) {
      settings.frequency = input.frequency;
    }

    return await this.notificationSettingsRepository.save(settings);
  }

  private async createDefaultSettings(
    userId: string,
  ): Promise<NotificationSettings> {
    const defaultSettings = this.notificationSettingsRepository.create({
      userId,
      channels: {
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.PUSH]: true,
        [NotificationChannel.SMS]: false,
        [NotificationChannel.DESKTOP]: true,
      },
      categories: {
        [NotificationCategory.DEALS]: true,
        [NotificationCategory.TASKS]: true,
        [NotificationCategory.MESSAGES]: true,
        [NotificationCategory.SYSTEM]: true,
        [NotificationCategory.MARKETING]: false,
      },
      frequency: NotificationFrequency.INSTANT,
    });

    return await this.notificationSettingsRepository.save(defaultSettings);
  }
}
