import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDealDto } from '../../libs/dto/deal/create-deal.dto';
import { UpdateDealDto } from '../../libs/dto/deal/update-deal.dto';
import { Client } from '../../libs/entities/client';
import { Deal } from '../../libs/entities/deal';
import { User } from '../../libs/entities/user';
import { Message } from '../../libs/enums/common.enums';
import { DealStage } from '../../libs/enums/deal-stage.enum';
import { UserRole } from '../../libs/enums/user.enums';
import { SocketService } from '../../socket/socket.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class DealService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly telegramService: TelegramService,
    @Optional()
    @Inject(SocketService)
    private readonly socketService?: SocketService,
  ) {}

  public async createDeal(
    input: CreateDealDto,
    createdById: string,
  ): Promise<Deal> {
    try {
      // 1. Client ni tekshirish
      const client = await this.clientRepository.findOne({
        where: { id: input.clientId },
      });

      if (!client) {
        throw new BadRequestException('Client not found');
      }

      // 2. Assigned user ni tekshirish (agar berilgan bo'lsa)
      const assigneeId = input.assignedToId ?? createdById;
      let assigneeName: string | undefined;
      if (assigneeId) {
        const assignee = await this.userRepository.findOne({
          where: { id: assigneeId },
        });

        if (!assignee) {
          throw new BadRequestException('Assigned user not found');
        }

        assigneeName = assignee.fullName ?? assignee.email;
      }

      const deal = this.dealRepository.create({
        title: input.title.trim(),
        amount: input.amount ?? 0,
        stage: input.stage ?? DealStage.New,
        clientId: input.clientId,
        assignedToId: assigneeId,
      });

      const savedDeal = await this.dealRepository.save(deal);

      await this.telegramService.notifyDealCreated({
        title: savedDeal.title,
        amount: savedDeal.amount,
        stage: savedDeal.stage,
        clientName: client.name,
        assignedTo: assigneeName,
      });

      // Socket event yuborish
      if (this.socketService) {
        this.socketService.broadcastDealCreated({
          id: savedDeal.id,
          title: savedDeal.title,
          stage: savedDeal.stage,
          amount: Number(savedDeal.amount),
          clientId: savedDeal.clientId,
          assignedToId: savedDeal.assignedToId,
          updatedBy: createdById,
        });
      }

      return savedDeal;
    } catch (error) {
      console.error('Create Deal error:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error.code === '23505') {
        throw new BadRequestException('Deal with this data already exists');
      }

      throw new InternalServerErrorException(
        error.message || Message.CREATE_FAILED,
      );
    }
  }

  async getAllDeals(userId: string, userRole: UserRole): Promise<Deal[]> {
    try {
      // Agar user ADMIN bo'lsa, barcha deal'larni qaytarish
      if (userRole === UserRole.ADMIN) {
        return await this.dealRepository.find({
          relations: ['client', 'assignedTo'],
          order: { createdAt: 'DESC' }, // Eng yangi deal'lar birinchi
        });
      }

      // Aks holda faqat user assigned qilingan deal'larni qaytarish
      return await this.dealRepository.find({
        where: { assignedToId: userId },
        relations: ['client', 'assignedTo'],
        order: { createdAt: 'DESC' }, // Eng yangi deal'lar birinchi
      });
    } catch (error) {
      console.error('Get All Deals error:', error);
      throw new InternalServerErrorException(
        error.message || Message.SOMETHING_WENT_WRONG,
      );
    }
  }

  async getDealById(userId: string, id: string): Promise<Deal> {
    try {
      const deal = await this.dealRepository.findOne({
        where: { id, assignedToId: userId },
        relations: ['client', 'assignedTo'],
      });

      if (!deal) {
        throw new BadRequestException(
          'Deal not found or you do not have permission to access this deal',
        );
      }

      return deal;
    } catch (error) {
      console.error('Get Deal By Id error:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      // UUID format xatoliklarini boshqarish
      if (error.code === '22P02') {
        throw new BadRequestException(
          'Invalid deal ID format. ID must be a valid UUID.',
        );
      }

      throw new InternalServerErrorException(
        error.message || Message.SOMETHING_WENT_WRONG,
      );
    }
  }

  async updateDeal(
    id: string,
    input: UpdateDealDto,
    userId: string,
  ): Promise<Deal> {
    try {
      // 1. Deal ni topish va user assigned ekanligini tekshirish
      const deal = await this.dealRepository.findOne({
        where: { id, assignedToId: userId },
      });

      if (!deal) {
        throw new BadRequestException(
          'Deal not found or you do not have permission to update this deal',
        );
      }

      // 2. Client ni tekshirish (agar yangilansa)
      if (input.clientId) {
        const client = await this.clientRepository.findOne({
          where: { id: input.clientId },
        });

        if (!client) {
          throw new BadRequestException('Client not found');
        }
        deal.clientId = input.clientId;
      }

      // 3. Assigned user ni tekshirish (agar yangilansa)
      if (input.assignedToId) {
        const assignee = await this.userRepository.findOne({
          where: { id: input.assignedToId },
        });

        if (!assignee) {
          throw new BadRequestException('Assigned user not found');
        }
        deal.assignedToId = input.assignedToId;
      }

      // 4. Boshqa fieldlarni yangilash
      if (input.title) {
        deal.title = input.title.trim();
      }

      if (input.amount !== undefined) {
        deal.amount = input.amount;
      }

      let previousStage: DealStage | null = null;
      if (input.stage && input.stage !== deal.stage) {
        previousStage = deal.stage;
        deal.stage = input.stage;
      }

      const updatedDeal = await this.dealRepository.save(deal);

      // Relations bilan qaytarish
      const result = await this.dealRepository.findOne({
        where: { id: updatedDeal.id },
        relations: ['client', 'assignedTo'],
      });

      if (previousStage && result) {
        await this.telegramService.notifyDealStageChanged(
          result,
          previousStage,
        );
      }

      // Socket event yuborish
      if (this.socketService) {
        this.socketService.broadcastDealUpdate({
          id: result.id,
          title: result.title,
          stage: result.stage,
          amount: Number(result.amount),
          clientId: result.clientId,
          assignedToId: result.assignedToId,
          updatedBy: userId,
        });
      }

      return result;
    } catch (error) {
      console.error('Update Deal error:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      // UUID format xatoliklarini boshqarish
      if (error.code === '22P02') {
        throw new BadRequestException(
          'Invalid deal ID format. ID must be a valid UUID.',
        );
      }

      throw new InternalServerErrorException(
        error.message || Message.UPDATE_FALED,
      );
    }
  }

  async deleteDeal(
    id: string,
    userId: string,
  ): Promise<{
    message: string;
    deletedDeal: Deal;
  }> {
    try {
      // 1. Deal ni topish
      const deal = await this.dealRepository.findOne({
        where: { id },
        relations: ['client', 'assignedTo'],
      });

      if (!deal) {
        throw new BadRequestException('Deal not found');
      }

      // 2. Deal'ni o'chirish
      await this.dealRepository.remove(deal);

      // Socket event yuborish
      if (this.socketService) {
        this.socketService.broadcastDealUpdate({
          id: deal.id,
          title: deal.title,
          stage: deal.stage,
          amount: Number(deal.amount),
          clientId: deal.clientId,
          assignedToId: deal.assignedToId,
          updatedBy: userId,
        });
      }

      return {
        message: 'Deal successfully deleted',
        deletedDeal: deal,
      };
    } catch (error) {
      console.error('Delete Deal error:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      // UUID format xatoliklarini boshqarish
      if (error.code === '22P02') {
        throw new BadRequestException(
          'Invalid deal ID format. ID must be a valid UUID.',
        );
      }

      // Foreign key constraint xatoliklarini boshqarish
      if (error.code === '23503') {
        throw new BadRequestException(
          'Cannot delete deal. It may have related records (tasks, etc.)',
        );
      }

      throw new InternalServerErrorException(
        error.message || Message.REMOVE_FAILED,
      );
    }
  }
}
