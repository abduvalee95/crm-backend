import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user';

@Entity('security_settings')
export class SecuritySettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  // Двухфакторная аутентификация
  @Column({ default: false })
  twoFactorAuth: boolean;

  // Автоматический выход (минуты)
  @Column({ type: 'int', default: 30, nullable: true })
  autoLogoutMinutes: number;

  // Логирование действий
  @Column({ default: true })
  activityLogging: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
