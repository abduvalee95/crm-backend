import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ComponentsModule } from './components/components.module';
import databaseConfig from './database/database.config';
import { DatabaseModule } from './database/database.module';
import { SocketModule } from './socket/socket.module';
import telegramConfig from './libs/config/telegram.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, telegramConfig],
      envFilePath: '.env',
    }),
    DatabaseModule,
    ComponentsModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
