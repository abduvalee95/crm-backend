import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateMessageDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
