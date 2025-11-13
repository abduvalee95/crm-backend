import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { DealStage } from '../../enums/deal-stage.enum';
import { Type } from 'class-transformer'

export class CreateDealDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number) // ← string -> number
  amount?: number;

  @IsEnum(DealStage)
  @IsOptional()
  stage?: DealStage;

  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;
}
