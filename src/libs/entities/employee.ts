import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from './message';
import { Task } from './task';
import { User } from './user';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  position: string;

  @OneToOne(() => User, (user) => user.employee, {
    onDelete: 'CASCADE',
  })
  user: User;

  // @OneToMany(() => Task, (task) => task.employee)
  // tasks: Task[];

  @OneToMany(() => Message, (message) => message.employee)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
