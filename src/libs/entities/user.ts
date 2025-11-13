import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enums/user.enums';
import { ActivityLog } from './activity-log';
import { Client } from './client';
import { Deal } from './deal';
import { Employee } from './employee';
import { Notification } from './notification';
import { Task } from './task';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;
  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  phone?: string;
  
  @Column({ nullable: true })
  token?: string;

  @OneToOne(() => Employee, (employee) => employee.user, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  employee: Employee;

  @OneToMany(() => Client, (client) => client.createdBy)
  createdClients: Client[];

  @OneToMany(() => Deal, (deal) => deal.assignedTo)
  assignedDeals: Deal[];

  @OneToMany(() => Task, (task) => task.assignedTo)
  assignedTasks: Task[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.user)
  activityLogs: ActivityLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
