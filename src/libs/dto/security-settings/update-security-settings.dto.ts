import { IsBoolean, IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSecuritySettingsDto {
  @IsBoolean()
  @IsOptional()
  twoFactorAuth?: boolean;

  @IsInt()
  @Min(5)
  @Max(480)
  @IsOptional()
  @Type(() => Number)
  autoLogoutMinutes?: number;

  @IsBoolean()
  @IsOptional()
  activityLogging?: boolean;
}

