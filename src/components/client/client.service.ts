import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from '../../libs/dto/client/create-client.dto';
import { Client } from '../../libs/entities/client';
import { ClientStatus } from '../../libs/enums/client-status.enum';
import { Message } from '../../libs/enums/common.enums';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    private readonly telegramService: TelegramService,
  ) {}

  public async createClient(
    input: CreateClientDto,
    createdById: string,
  ): Promise<Client> {
    console.log('=== Create Client Service ===');
    console.log('Input:', input);
    console.log('Created by Admin ID:', createdById);

    try {
      // Email chek
      const existingClient = await this.clientRepository.findOne({
        where: { email: input.email },
      });

      if (existingClient) {
        throw new BadRequestException('Client with this email already exists');
      }

      const client = this.clientRepository.create({
        name: input.name,
        email: input.email.trim().toLowerCase(),
        phone: input.phone,
        company: input.company,
        notes: input.notes,
        status: input.status || ClientStatus.new,
        createdById: createdById,
      });

      const savedClient = await this.clientRepository.save(client);
      console.log('Client:', savedClient.id);

      await this.telegramService.notifyClientCreated(savedClient);

      return savedClient;
    } catch (error) {
      console.error('Create Client error:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error.code === '23505') {
        // Unique constraint violation (email)
        throw new BadRequestException('Client with this email already exists');
      }

      throw new InternalServerErrorException(
        error.message || Message.CREATE_FAILED,
      );
    }
  }

  async getAllClients(userId: string): Promise<Client[]> {
    try {
      // Faqat user yaratgan clientlarni qaytarish
      return await this.clientRepository.find({
        where: { createdById: userId },
        order: { createdAt: 'DESC' }, // Eng yangi clientlar birinchi
      });
    } catch (error) {
      console.error('Get All Clients error:', error);
      throw new InternalServerErrorException(
        error.message || Message.SOMETHING_WENT_WRONG,
      );
    }
  }

  async getClientById(userId: string, id: string): Promise<Client> {
    try {
      const client = await this.clientRepository.findOne({
        where: { id, createdById: userId },
      });

      if (!client) {
        throw new BadRequestException(
          'Client not found or you do not have permission to access this client',
        );
      }

      return client;
    } catch (error) {
      console.error('Get Client By Id error:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      // UUID format xatoliklarini boshqarish
      if (error.code === '22P02') {
        throw new BadRequestException(
          'Invalid client ID format. ID must be a valid UUID.',
        );
      }

      throw new InternalServerErrorException(
        error.message || Message.SOMETHING_WENT_WRONG,
      );
    }
  }
}
