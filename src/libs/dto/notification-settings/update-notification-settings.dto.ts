import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { NotificationCategory } from '../../enums/notification-category.enum';
import { NotificationChannel } from '../../enums/notification-channel.enum';
import { NotificationFrequency } from '../../enums/notification-frequency.enum';

class ChannelPreferencesDto {
  @IsBoolean()
  @IsOptional()
  [NotificationChannel.EMAIL]?: boolean;

  @IsBoolean()
  @IsOptional()
  [NotificationChannel.PUSH]?: boolean;

  @IsBoolean()
  @IsOptional()
  [NotificationChannel.SMS]?: boolean;

  @IsBoolean()
  @IsOptional()
  [NotificationChannel.DESKTOP]?: boolean;
}

class CategoryPreferencesDto {
  @IsBoolean()
  @IsOptional()
  [NotificationCategory.DEALS]?: boolean;

  @IsBoolean()
  @IsOptional()
  [NotificationCategory.TASKS]?: boolean;

  @IsBoolean()
  @IsOptional()
  [NotificationCategory.MESSAGES]?: boolean;

  @IsBoolean()
  @IsOptional()
  [NotificationCategory.SYSTEM]?: boolean;

  @IsBoolean()
  @IsOptional()
  [NotificationCategory.MARKETING]?: boolean;
}

export class UpdateNotificationSettingsDto {
  @IsObject()
  @ValidateNested()
  @Type(() => ChannelPreferencesDto)
  @IsOptional()
  channels?: ChannelPreferencesDto;

  @IsObject()
  @ValidateNested()
  @Type(() => CategoryPreferencesDto)
  @IsOptional()
  categories?: CategoryPreferencesDto;

  @IsEnum(NotificationFrequency)
  @IsOptional()
  frequency?: NotificationFrequency;
}
