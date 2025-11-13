import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ClientStatus } from '../../enums/client-status.enum';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;
}
