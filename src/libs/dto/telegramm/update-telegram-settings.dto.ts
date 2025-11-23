import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateTelegramSettingsDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  botToken?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  defaultChatId?: string;
}

export class TestTelegramSettingsDto extends UpdateTelegramSettingsDto {
  @IsOptional()
  @IsString()
  message?: string;
}

