import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramSettings } from 'src/libs/entities/telegramm';
import telegramConfig from '../../libs/config/telegram.config';
import { AuthModule } from '../auth/auth.module';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Module({
  imports: [
    ConfigModule.forFeature(telegramConfig),
    AuthModule,
    TypeOrmModule.forFeature([TelegramSettings]),
  ],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
