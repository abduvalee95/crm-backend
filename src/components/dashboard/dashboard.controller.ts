import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetDashboardStatsDto } from '../../libs/dto/dashboard/get-dashboard-stats.dto';
import { User } from '../../libs/entities/user';
import { CurrentUser } from '../auth/decorator/current.decorator';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(
    @Query() query: GetDashboardStatsDto,
    @CurrentUser() user: User,
  ) {
    return await this.dashboardService.getStats(query, user.id, user.role);
  }
}
