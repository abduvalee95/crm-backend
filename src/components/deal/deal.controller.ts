import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateDealDto } from '../../libs/dto/deal/create-deal.dto';
import { UpdateDealDto } from '../../libs/dto/deal/update-deal.dto';
import { Deal } from '../../libs/entities/deal';
import { User } from '../../libs/entities/user';
import { UserRole } from '../../libs/enums/user.enums';
import { CurrentUser } from '../auth/decorator/current.decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { DealService } from './deal.service';

@Controller('deal')
export class DealController {
  constructor(private readonly dealService: DealService) {}

  @Post('create')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async createDeal(
    @Body() input: CreateDealDto,
    @CurrentUser() user: User,
  ): Promise<Deal> {
    return await this.dealService.createDeal(input, user.id);
  }

  @Get('all')
  @UseGuards(AuthGuard)
  async getAllDeals(@CurrentUser() user: User): Promise<Deal[]> {
    return await this.dealService.getAllDeals(user.id, user.role);
  }

  @Get('get/:id')
  @UseGuards(AuthGuard)
  async getDealById(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: 400,
        exceptionFactory: () =>
          new BadRequestException(
            'Invalid deal ID format. ID must be a valid UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)',
          ),
      }),
    )
    id: string,
    @CurrentUser() user: User,
  ): Promise<Deal> {
    return await this.dealService.getDealById(user.id, id);
  }

  @Put('update/:id')
  @UseGuards(AuthGuard)
  async updateDeal(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: 400,
        exceptionFactory: () =>
          new BadRequestException(
            'Invalid deal ID format. ID must be a valid UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)',
          ),
      }),
    )
    id: string,
    @Body() input: UpdateDealDto,
    @CurrentUser() user: User,
  ): Promise<Deal> {
    return await this.dealService.updateDeal(id, input, user.id);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async deleteDeal(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: 400,
        exceptionFactory: () =>
          new BadRequestException(
            'Invalid deal ID format. ID must be a valid UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)',
          ),
      }),
    )
    id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string; deletedDeal: Deal }> {
    return await this.dealService.deleteDeal(id, user.id);
  }
}
