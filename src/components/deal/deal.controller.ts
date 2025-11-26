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
    console.log('=== Create Deal Request ===');
    console.log('Request body:', input);
    console.log('Created by:', user.id, user.role);

    return await this.dealService.createDeal(input, user.id);
  }

  @Get('all')
  @UseGuards(AuthGuard)
  async getAllDeals(@CurrentUser() user: User): Promise<Deal[]> {
    console.log('=== Get All Deals Request ===');
    console.log('User ID:', user.id);
    console.log('User Role:', user.role);
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
    console.log('=== Get Deal By Id Request ===');
    console.log('Deal ID:', id);
    console.log('User ID:', user.id);
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
    console.log('=== Update Deal Request ===');
    console.log('Deal ID:', id);
    console.log('Request body:', input);
    console.log('User ID:', user.id);
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
    console.log('=== Delete Deal Request ===');
    console.log('Deal ID:', id);
    console.log('User ID:', user.id);
    console.log('User Role:', user.role);
    return await this.dealService.deleteDeal(id, user.id);
  }
}
