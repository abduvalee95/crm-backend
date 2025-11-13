import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { DealStage } from '../../enums/deal-stage.enum';
import { Type } from 'class-transformer'

export class UpdateDealDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number) // ← string -> number
  amount?: number;

  @IsEnum(DealStage)
  @IsOptional()
  stage?: DealStage;

  @IsUUID()
  @IsOptional()
  clientId?: string;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;
}
