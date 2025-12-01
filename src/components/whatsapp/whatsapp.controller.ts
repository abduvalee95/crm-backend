import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '../../libs/enums/user.enums';
import { Roles } from '../auth/decorator/roles.decorator';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('qr')
  @UseGuards(AuthGuard) // Frontend QR code ni olish uchun auth kerak bo'lishi mumkin
  async getQrCode() {
    return await this.whatsappService.getQrCode();
  }

  @Get('status')
  @UseGuards(AuthGuard)
  async getStatus() {
    return this.whatsappService.getStatus();
  }

  @Post('send')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async sendMessage(@Body() body: { to: string; message: string }) {
    return await this.whatsappService.sendMessage(body.to, body.message);
  }
}
