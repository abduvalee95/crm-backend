import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationCategory } from '../enums/notification-category.enum';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationFrequency } from '../enums/notification-frequency.enum';
import { User } from './user';

@Entity('notification_settings')
export class NotificationSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  // Channel preferences (JSON format)
  @Column({ type: 'jsonb', default: {} })
  channels: {
    [NotificationChannel.EMAIL]: boolean;
    [NotificationChannel.PUSH]: boolean;
    [NotificationChannel.SMS]: boolean;
    [NotificationChannel.DESKTOP]: boolean;
  };

  // Category preferences (JSON format)
  @Column({ type: 'jsonb', default: {} })
  categories: {
    [NotificationCategory.DEALS]: boolean;
    [NotificationCategory.TASKS]: boolean;
    [NotificationCategory.MESSAGES]: boolean;
    [NotificationCategory.SYSTEM]: boolean;
    [NotificationCategory.MARKETING]: boolean;
  };

  // Frequency preference
  @Column({
    type: 'enum',
    enum: NotificationFrequency,
    default: NotificationFrequency.INSTANT,
  })
  frequency: NotificationFrequency;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
