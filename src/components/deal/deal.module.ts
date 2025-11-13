import { Module } from '@nestjs/common';
import { DealController } from './deal.controller';

@Module({
  controllers: [DealController]
})
export class DealModule {}
