import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { DealModule } from './deal/deal.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, UserModule, DealModule, ClientModule],
})
export class ComponentsModule {}
