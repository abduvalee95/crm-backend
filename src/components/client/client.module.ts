import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../../libs/entities/client';
import { AuthModule } from '../auth/auth.module';
import { TelegramModule } from '../telegram/telegram.module';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';

@Module({
  imports: [TypeOrmModule.forFeature([Client]), AuthModule, TelegramModule],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
