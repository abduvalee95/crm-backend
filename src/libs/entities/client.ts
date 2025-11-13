import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClientStatus } from '../enums/client-status.enum';
import { Deal } from './deal';
import { Task } from './task';
import { User } from './user';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid') 
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  company: string;
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({
    type: 'enum',
    enum: ClientStatus,
    default: ClientStatus.new
  })
  status: ClientStatus;

  // bu erda user id qoshiladi agar bolmasa admin yoki manager qoshadi
  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
    nullable: true,
  })

  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by', nullable: true })
  createdById: string;

  // bu erda deals client tomonidan qoshiladi 
  @OneToMany(() => Deal, (deal) => deal.client)
  deals: Deal[];

  @OneToMany(() => Task, (task) => task.client)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;
}
