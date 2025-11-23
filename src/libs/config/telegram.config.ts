import { registerAs } from '@nestjs/config';

export interface TelegramConfig {
  botToken: string;
  defaultChatId: string;
  enabled: boolean;
}

export default registerAs(
  'telegram',
  (): TelegramConfig => ({
    botToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
    defaultChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID ?? '',
    enabled:
      (process.env.TELEGRAM_ENABLED ?? 'true').toLowerCase() !== 'false' &&
      !!process.env.TELEGRAM_BOT_TOKEN,
  }),
);
