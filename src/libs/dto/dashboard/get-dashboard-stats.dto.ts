import { IsDateString, IsOptional } from 'class-validator';

export class GetDashboardStatsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
