import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('telegram_settings')
export class TelegramSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  botToken?: string;

  @Column({ nullable: true })
  defaultChatId?: string;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}