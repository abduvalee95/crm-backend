import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { GetDashboardStatsDto } from '../../libs/dto/dashboard/get-dashboard-stats.dto';
import { Client } from '../../libs/entities/client';
import { Deal } from '../../libs/entities/deal';
import { Task } from '../../libs/entities/task';
import { User } from '../../libs/entities/user';
import { DealStage } from '../../libs/enums/deal-stage.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getStats(query: GetDashboardStatsDto, userId: string, role: string) {
    const { startDate, endDate } = query;

    // Sana oralig'ini belgilash (agar berilmagan bo'lsa, oxirgi 30 kun)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setDate(start.getDate() - 30);
    }

    // User roli bo'yicha filtrlash (Admin hamma narsani ko'radi, Manager o'zinikini)
    const whereUser = role === 'admin' ? {} : { assignedToId: userId };
    const whereCreatedBy = role === 'admin' ? {} : { createdById: userId };

    // 1. Umumiy statistika
    const totalDeals = await this.dealRepository.count({
      where: {
        ...whereUser,
        createdAt: Between(start, end),
      },
    });

    const totalClients = await this.clientRepository.count({
      where: {
        ...whereCreatedBy,
        createdAt: Between(start, end),
      },
    });

    const totalTasks = await this.taskRepository.count({
      where: {
        ...whereUser,
        createdAt: Between(start, end),
      },
    });

    // Jami summa (Deals amount)
    const { sum: totalRevenue } = await this.dealRepository
      .createQueryBuilder('deal')
      .select('SUM(deal.amount)', 'sum')
      .where('deal.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere(role === 'admin' ? '1=1' : 'deal.assigned_to = :userId', {
        userId,
      })
      .getRawOne();

    // 2. Sotuv voronkasi (Sales Funnel)
    const funnel = await this.dealRepository
      .createQueryBuilder('deal')
      .select('deal.stage', 'stage')
      .addSelect('COUNT(deal.id)', 'count')
      .addSelect('SUM(deal.amount)', 'amount')
      .where('deal.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere(role === 'admin' ? '1=1' : 'deal.assigned_to = :userId', {
        userId,
      })
      .groupBy('deal.stage')
      .getRawMany();

    // 3. Tasklar statusi bo'yicha
    const taskStats = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(task.id)', 'count')
      .where('task.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere(role === 'admin' ? '1=1' : 'task.assigned_to = :userId', {
        userId,
      })
      .groupBy('task.status')
      .getRawMany();

    // 4. Menejerlar reytingi (faqat Admin uchun)
    let topPerformers = [];
    if (role === 'admin') {
      topPerformers = await this.dealRepository
        .createQueryBuilder('deal')
        .leftJoinAndSelect('deal.assignedTo', 'user')
        .select('user.fullName', 'name')
        .addSelect('COUNT(deal.id)', 'dealsCount')
        .addSelect('SUM(deal.amount)', 'totalAmount')
        .where('deal.createdAt BETWEEN :start AND :end', { start, end })
        .andWhere('deal.stage = :stage', { stage: DealStage.Closed })
        .groupBy('user.id')
        .orderBy('totalAmount', 'DESC') // TypeORM da ba'zan 'SUM(deal.amount)' deb yozish kerak bo'lishi mumkin, lekin alias ishlashi kerak
        .limit(5)
        .getRawMany();
    }

    // 5. So'nggi bitimlar
    const recentDeals = await this.dealRepository.find({
      where: { ...whereUser },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['client'],
    });

    return {
      summary: {
        totalDeals,
        totalClients,
        totalTasks,
        totalRevenue: Number(totalRevenue || 0),
      },
      funnel: funnel.map((item) => ({
        stage: item.stage,
        count: Number(item.count),
        amount: Number(item.amount || 0),
      })),
      taskStats: taskStats.map((item) => ({
        status: item.status,
        count: Number(item.count),
      })),
      topPerformers: topPerformers.map((item) => ({
        name: item.name,
        dealsCount: Number(item.dealsCount),
        totalAmount: Number(item.totalAmount),
      })),
      recentDeals,
    };
  }
}
