import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateTaskDto } from '../../libs/dto/task/create-task.dto';
import { UpdateTaskDto } from '../../libs/dto/task/update-task.dto';
import { Client } from '../../libs/entities/client';
import { Deal } from '../../libs/entities/deal';
import { Task } from '../../libs/entities/task';
import { User } from '../../libs/entities/user';
import { Message } from '../../libs/enums/common.enums';
import { TaskStatus } from '../../libs/enums/task-status.enum';
import { UserRole } from '../../libs/enums/user.enums';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
  ) {}

  async createTask(input: CreateTaskDto, userId: string): Promise<Task> {
    try {
      // Validate Client (optional)
      if (input.clientId) {
        const client = await this.clientRepository.findOne({
          where: { id: input.clientId },
        });
        if (!client) throw new BadRequestException('Client not found');
      }

      // Validate Deal (optional)
      if (input.dealId) {
        const deal = await this.dealRepository.findOne({
          where: { id: input.dealId },
        });
        if (!deal) throw new BadRequestException('Deal not found');
      }

      // Validate Assigned User
      const assigneeId = input.assignedToId || userId;
      const assignee = await this.userRepository.findOne({
        where: { id: assigneeId },
      });
      if (!assignee) throw new BadRequestException('Assigned user not found');

      const task = this.taskRepository.create({
        ...input,
        assignedToId: assigneeId,
        status: input.status || TaskStatus.PENDING,
      });

      return await this.taskRepository.save(task);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(Message.CREATE_FAILED);
    }
  }

  async getAllTasks(userId: string, role: string): Promise<Task[]> {
    const where = role === UserRole.ADMIN ? {} : { assignedToId: userId };

    return await this.taskRepository.find({
      where,
      relations: ['client', 'deal', 'assignedTo'],
      order: { dueDate: 'ASC' },
    });
  }

  async getTaskById(id: string, userId: string, role: string): Promise<Task> {
    const where =
      role === UserRole.ADMIN ? { id } : { id, assignedToId: userId };

    const task = await this.taskRepository.findOne({
      where,
      relations: ['client', 'deal', 'assignedTo'],
    });

    if (!task) throw new BadRequestException(Message.NO_DATA_FOUND);
    return task;
  }

  async updateTask(
    id: string,
    input: UpdateTaskDto,
    userId: string,
    role: string,
  ): Promise<Task> {
    const task = await this.getTaskById(id, userId, role);

    Object.assign(task, input);

    return await this.taskRepository.save(task);
  }

  async deleteTask(id: string, userId: string, role: string): Promise<void> {
    const task = await this.getTaskById(id, userId, role);
    await this.taskRepository.remove(task);
  }

  // Calendar View uchun
  async getTasksForCalendar(
    userId: string,
    role: string,
    start: Date,
    end: Date,
  ) {
    const where =
      role === UserRole.ADMIN
        ? { dueDate: Between(start, end) }
        : { assignedToId: userId, dueDate: Between(start, end) };

    const tasks = await this.taskRepository.find({
      where,
      relations: ['assignedTo'],
    });

    // Frontend calendar formatiga moslashtirish (masalan FullCalendar)
    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      start: task.dueDate, // Yoki createdAt agar dueDate bo'lmasa
      end: task.dueDate, // Davomiyligi bo'lsa qo'shish mumkin
      allDay: true,
      extendedProps: {
        description: task.description,
        status: task.status,
        priority: 'high', // Agar priority bo'lsa
        assignedTo: task.assignedTo?.fullName,
      },
      backgroundColor: this.getColorByStatus(task.status),
    }));
  }

  private getColorByStatus(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.COMPLETED:
        return '#28a745'; // Green
      case TaskStatus.IN_PROGRESS:
        return '#ffc107'; // Yellow
      case TaskStatus.PENDING:
        return '#17a2b8'; // Cyan
      case TaskStatus.CANCELLED:
        return '#dc3545'; // Red
      default:
        return '#6c757d'; // Grey
    }
  }
}
