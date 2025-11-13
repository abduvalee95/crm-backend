import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ClientStatus } from '../../enums/client-status.enum';

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  messages?: string;

  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;
}
