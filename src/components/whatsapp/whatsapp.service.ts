import { Injectable, OnModuleInit } from '@nestjs/common';
import * as qrcode from 'qrcode';
import { Client, LocalAuth } from 'whatsapp-web.js';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: Client;
  private qrCode: string = '';
  private isReady: boolean = false;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process', 
          '--disable-web-security',
          '--disable-gpu',
        ],
      },
      webVersionCache: {
        type: 'remote',
        remotePath:
          'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
      },
    });

    this.initializeClient();
  }

  onModuleInit() {
    // Module initialization logic if needed
  }

  private initializeClient() {
    this.client.on('qr', async (qr) => {
      console.log('WhatsApp QR Received');
      try {
        this.qrCode = await qrcode.toDataURL(qr);
      } catch (err) {
        console.error('Error generating QR code', err);
      }
    });

    this.client.on('ready', () => {
      console.log('WhatsApp Client is ready!');
      this.isReady = true;
      this.qrCode = ''; // Clear QR code when connected
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp Authenticated');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('WhatsApp Authentication failure', msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp Disconnected', reason);
      this.isReady = false;
      // Reinitialize after disconnect
      this.client.initialize();
    });

    console.log('Initializing WhatsApp Client...');
    this.client.initialize();
  }

  async getQrCode(): Promise<{ qrCode: string; status: string }> {
    return {
      qrCode: this.qrCode,
      status: this.isReady ? 'CONNECTED' : 'WAITING_FOR_SCAN',
    };
  }

  async sendMessage(to: string, message: string): Promise<any> {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    // Telefon raqamini tozalash: faqat raqamlarni qoldirish

    const cleanedNumber = to.replace(/\D/g, '');

    if (!cleanedNumber || cleanedNumber.length < 10) {
      throw new Error('Invalid phone number format');
    }

    // WhatsApp ID format: raqam@c.us
    const chatId = `${cleanedNumber}@c.us`;

    try {
      // Avval chat mavjudligini tekshirish (ixtiyoriy)
      const isRegistered = await this.client.isRegisteredUser(chatId);
      if (!isRegistered) {
        throw new Error(
          `Phone number ${cleanedNumber} is not registered on WhatsApp`,
        );
      }

      const response = await this.client.sendMessage(chatId, message);
      return {
        success: true,
        messageId: response.id._serialized,
        to: cleanedNumber,
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);

      // Xatolik xabarlarini yaxshiroq formatlash
      if (error.message?.includes('No LID for user')) {
        throw new Error(
          `Cannot send message to ${cleanedNumber}. The number may not be registered on WhatsApp or the format is incorrect.`,
        );
      }

      if (error.message?.includes('not registered')) {
        throw error;
      }

      throw new Error(
        `Failed to send WhatsApp message: ${error.message || 'Unknown error'}`,
      );
    }
  }

  getStatus(): { isReady: boolean } {
    return { isReady: this.isReady };
  }
}
