import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSecuritySettingsDto } from '../../libs/dto/security-settings/update-security-settings.dto';
import { SecuritySettings } from '../../libs/entities/security-settings';

@Injectable()
export class SecuritySettingsService {
  constructor(
    @InjectRepository(SecuritySettings)
    private securitySettingsRepository: Repository<SecuritySettings>,
  ) {}

  async getSettings(userId: string): Promise<SecuritySettings> {
    let settings = await this.securitySettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = await this.createDefaultSettings(userId);
    }

    return settings;
  }

  async updateSettings(
    userId: string,
    input: UpdateSecuritySettingsDto,
  ): Promise<SecuritySettings> {
    let settings = await this.securitySettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = await this.createDefaultSettings(userId);
    }

    if (input.twoFactorAuth !== undefined) {
      settings.twoFactorAuth = input.twoFactorAuth;
    }

    if (input.autoLogoutMinutes !== undefined) {
      settings.autoLogoutMinutes = input.autoLogoutMinutes;
    }

    if (input.activityLogging !== undefined) {
      settings.activityLogging = input.activityLogging;
    }

    return await this.securitySettingsRepository.save(settings);
  }

  private async createDefaultSettings(
    userId: string,
  ): Promise<SecuritySettings> {
    const defaultSettings = this.securitySettingsRepository.create({
      userId,
      twoFactorAuth: false,
      autoLogoutMinutes: 30,
      activityLogging: true,
    });

    return await this.securitySettingsRepository.save(defaultSettings);
  }
}
