import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosError } from 'axios';
import { TelegramSettings } from 'src/libs/entities/telegramm';
import { Repository } from 'typeorm';
import {
  TestTelegramSettingsDto,
  UpdateTelegramSettingsDto,
} from '../../libs/dto/telegramm/update-telegram-settings.dto';
import { Client } from '../../libs/entities/client';
import { Deal } from '../../libs/entities/deal';
import { DealStage } from '../../libs/enums/deal-stage.enum';

interface DealNotificationPayload {
  title: string;
  amount?: number;
  stage?: DealStage;
  clientName?: string;
  assignedTo?: string;
}

interface TelegramConfig {
  enabled: boolean;
  botToken?: string | null;
  defaultChatId?: string | null;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly config: TelegramConfig;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(TelegramSettings)
    private readonly telegramSettingsRepository: Repository<TelegramSettings>,
  ) {
    this.config = {
      enabled: this.configService.get<boolean>('telegram.enabled', false),
      botToken: this.configService.get<string>('telegram.botToken') ?? '',
      defaultChatId:
        this.configService.get<string>('telegram.defaultChatId') ?? '',
    };
  }
  private async getOrCreateSettings(): Promise<TelegramSettings> {
    let settings = await this.telegramSettingsRepository.findOne({
      where: {},
    });

    if (!settings) {
      settings = this.telegramSettingsRepository.create({
        botToken: this.config.botToken || null,
        defaultChatId: this.config.defaultChatId || null,
        enabled: this.config.enabled,
      });
      await this.telegramSettingsRepository.save(settings);
    }

    return settings;
  }

  private async getEffectiveConfig(): Promise<TelegramConfig> {
    const dbSettings = await this.getOrCreateSettings();

    // Database'dagi sozlamalar ustunlik qiladi, agar mavjud bo'lsa
    return {
      enabled: dbSettings.enabled,
      botToken: dbSettings.botToken || this.config.botToken || null,
      defaultChatId:
        dbSettings.defaultChatId || this.config.defaultChatId || null,
    };
  }
  private maskToken(token?: string | null): string | null {
    if (!token) {
      return null;
    }
    if (token.length <= 6) {
      return '***';
    }
    const visible = token.slice(-4);
    return `***${visible}`;
  }

  async getSanitizedSettings() {
    const dbSettings = await this.getOrCreateSettings();
    const effectiveConfig = await this.getEffectiveConfig();

    return {
      enabled: effectiveConfig.enabled,
      defaultChatId: effectiveConfig.defaultChatId ?? '',
      botTokenPreview: this.maskToken(effectiveConfig.botToken),
      source: dbSettings.botToken
        ? 'database'
        : this.config.botToken
          ? 'env'
          : 'none',
      updatedAt: dbSettings.updatedAt,
    };
  }

  async updateSettings(body: UpdateTelegramSettingsDto) {
    const settings = await this.getOrCreateSettings();

    if (body.enabled !== undefined) {
      settings.enabled = body.enabled;
    }
    if (body.botToken !== undefined && body.botToken.trim()) {
      settings.botToken = body.botToken.trim();
    }
    if (body.defaultChatId !== undefined && body.defaultChatId.trim()) {
      settings.defaultChatId = body.defaultChatId.trim();
    }

    await this.telegramSettingsRepository.save(settings);

    this.logger.log('Telegram settings updated in database');
    return this.getSanitizedSettings();
  }

  async testConnection(body: TestTelegramSettingsDto) {
    const effectiveConfig = await this.getEffectiveConfig();

    const testConfig: TelegramConfig = {
      enabled: body.enabled ?? effectiveConfig.enabled ?? true,
    botToken: body.botToken?.trim() || effectiveConfig.botToken,
    defaultChatId: body.defaultChatId?.trim() || effectiveConfig.defaultChatId,
    };

    await this.sendMessageInternal(
      body.message ?? 'CRM Telegram integrat',
      testConfig,
    );
  }

  private async sendMessageInternal(
    message: string,
    config?: TelegramConfig,
  ): Promise<void> {
    const effectiveConfig = config ?? await this.getEffectiveConfig();

    if (!effectiveConfig.enabled) {
      this.logger.debug('Telegram notifications disabled or not configured');
      return;
    }

    if (!effectiveConfig.botToken) {
      this.logger.warn('Telegram bot token missing, skipping notification');
      return;
    }

    const targetChatId = effectiveConfig.defaultChatId;
    if (!targetChatId) {
      this.logger.warn('Telegram chat ID is missing, skipping notification');
      return;
    }

    try {
      await axios.post(
        `https://api.telegram.org/bot${effectiveConfig.botToken}/sendMessage`,
        {
          chat_id: targetChatId,
          text: message,
          parse_mode: 'Markdown',
        },
      );
    } catch (error) {
      const axiosError = error as AxiosError<{ description?: string }>;
      const description =
        axiosError.response?.data?.description ?? axiosError.message;
      this.logger.error(`Failed to send Telegram message: ${description}`);
      throw new Error(`Failed to send Telegram message: ${description}`);
    }
  }

  async sendMessage(message: string, chatId?: string): Promise<void> {
    const effectiveConfig = await this.getEffectiveConfig();

    const customConfig: TelegramConfig = {
      ...effectiveConfig,
      defaultChatId: chatId ?? effectiveConfig.defaultChatId,
    };
    await this.sendMessageInternal(message, customConfig);
  }

  async notifyClientCreated(client: Client): Promise<void> {
    const message = [
      '🆕 **New client created**',
      `👤 *name:* ${client.name}`,
      client.company ? `*company:* ${client.company}` : null,
      client.email ? ` *Email:* ${client.email}` : null,
      client.phone ? `*phone:* ${client.phone}` : null,
      client.status ? `*Status:* ${client.status}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    await this.sendMessage(message);
  }

  async notifyDealCreated(payload: DealNotificationPayload): Promise<void> {
    const message = [
      '🤝 *New deal created!*',
      `📄 *Nom:* ${payload.title}`,
      payload.amount !== undefined ? `💰 *Summasi:* ${payload.amount}` : null,
      payload.stage ? `🚦 *Stage:* ${payload.stage}` : null,
      payload.clientName ? `👤 *Client:* ${payload.clientName}` : null,
      payload.assignedTo ? `👥 *Assigned to:* ${payload.assignedTo}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    await this.sendMessage(message);
  }

  async notifyDealStageChanged(
    deal: Deal,
    previousStage: DealStage,
  ): Promise<void> {
    const message = [
      '♻️ *Deal changed*',
      `📄 *Name:* ${deal.title}`,
      `🚦 *old:* ${previousStage}`,
      `✅ *new:* ${deal.stage}`,
    ].join('\n');

    await this.sendMessage(message);
  }
}
