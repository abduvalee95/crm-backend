import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { ActivityLog } from '../libs/entities/activity-log';
import { Client } from '../libs/entities/client';
import { Deal } from '../libs/entities/deal';
import { Employee } from '../libs/entities/employee';
import { Message } from '../libs/entities/message';
import { Notification } from '../libs/entities/notification';
import { Task } from '../libs/entities/task';
import { User } from '../libs/entities/user';
import { TelegramSettings } from 'src/libs/entities/telegramm'

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_DATABASE || 'crm_db',
    entities: [
      User,
      Client,
      Deal,
      Task,
      Employee,
      Message,
      Notification,
      ActivityLog,
      TelegramSettings,
    ],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    migrations: [join(__dirname, '..', 'migrations', '*.{.ts,.js}')],
    migrationsRun: false,
  }),
);
