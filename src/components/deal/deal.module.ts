import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../../libs/entities/client';
import { Deal } from '../../libs/entities/deal';
import { User } from '../../libs/entities/user';
import { AuthModule } from '../auth/auth.module';

import { SocketModule } from '../../socket/socket.module';
import { TelegramModule } from '../telegram/telegram.module';
import { DealController } from './deal.controller';
import { DealService } from './deal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deal, Client, User]),
    AuthModule,
    TelegramModule,
    forwardRef(() => SocketModule),
  ],
  controllers: [DealController],
  providers: [DealService],
  exports: [DealService],
})
export class DealModule {}
