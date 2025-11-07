import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectDataSource, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import databaseConfig from './database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      // Database connection tekshirish
      if (this.dataSource.isInitialized) {
        const port =
          this.configService.get<number>('database.port') ||
          parseInt(process.env.DB_PORT, 10) ||
          5432;
        const database =
          this.configService.get<string>('database.database') ||
          process.env.DB_DATABASE ||
          'crm_db';

        this.logger.log(`Database runinng ${port}/${database}`);

        // PostgreSQL versiyasini olish
        try {
          const result = await this.dataSource.query('SELECT version()');
          const version =
            result[0].version.split(' ')[0] +
            ' ' +
            result[0].version.split(' ')[1];
          this.logger.log(`PostgreSQL: ${version}`);
        } catch (error) {
          this.logger.warn('erorr version');
        }
      } else {
        this.logger.error('Database connection failed');
      }
    } catch (error) {
      this.logger.error('Database connection failed');
      this.logger.error(`Error message is: ${error.message}`);
    }
  }
}
