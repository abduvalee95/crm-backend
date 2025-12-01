import { Module } from '@nestjs/common';
import { AccessControlModule } from './access-control/access-control.module';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DealModule } from './deal/deal.module';
import { MailModule } from './mail/mail.module';
import { NotificationSettingsModule } from './notification-settings/notification-settings.module';
import { SecuritySettingsModule } from './security-settings/security-settings.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    DealModule,
    ClientModule,
    TaskModule,
    WhatsappModule,
    NotificationSettingsModule,
    SecuritySettingsModule,
    AccessControlModule,
    DashboardModule,
    MailModule,
  ],
})
export class ComponentsModule {}
