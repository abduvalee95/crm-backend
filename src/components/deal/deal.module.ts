import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../../libs/entities/client';
import { Deal } from '../../libs/entities/deal';
import { User } from '../../libs/entities/user';
import { AuthModule } from '../auth/auth.module';

import { DealController } from './deal.controller';
import { DealService } from './deal.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deal, Client, User]),
    AuthModule,
    TelegramModule,
  ],
  controllers: [DealController],
  providers: [DealService],
  exports: [DealService],
})
export class DealModule {}
