import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecuritySettings } from '../../libs/entities/security-settings';
import { AuthModule } from '../auth/auth.module';
import { SecuritySettingsController } from './security-settings.controller';
import { SecuritySettingsService } from './security-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([SecuritySettings]), AuthModule],
  controllers: [SecuritySettingsController],
  providers: [SecuritySettingsService],
  exports: [SecuritySettingsService],
})
export class SecuritySettingsModule {}

