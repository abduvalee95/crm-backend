import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateClientDto } from '../../libs/dto/client/create-client.dto';
import { Client } from '../../libs/entities/client';
import { User } from '../../libs/entities/user';
import { UserRole } from '../../libs/enums/user.enums';
import { CurrentUser } from '../auth/decorator/current.decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { ClientService } from './client.service';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('create')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createClient(
    @Body() input: CreateClientDto,
    @CurrentUser() user: User,
  ): Promise<Client> {
    console.log('=== Create Client Request ===');
    console.log('Request body:', input);
    console.log('Created by Admin:', user.id, user.role);

    return await this.clientService.createClient(input, user.id);
  }

  @Get('all')
  @UseGuards(AuthGuard) // Faqat autentifikatsiya qilingan userlar
  async getAllClients(@CurrentUser() user: User): Promise<Client[]> {
    console.log('=== Get All Clients Request ===');
    console.log('User ID:', user.id);
    return await this.clientService.getAllClients(user.id);
  }
  @Get('get/:id')
  @UseGuards(AuthGuard) // ← JWT token tekshirish
  async getClientById(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: 400,
        exceptionFactory: () =>
          new BadRequestException(
            'Invalid client ID format. ID must be a valid UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)',
          ),
      }),
    )
    id: string, // ← URL parametridan id olish
    @CurrentUser() user: User, // ← Autentifikatsiya qilingan user
  ): Promise<Client> {
    console.log('=== Get Client By Id Request ===');
    console.log('Client ID:', id);
    console.log('User ID:', user.id);
    return await this.clientService.getClientById(user.id, id);
  }
}
