import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getSequelizeConfig } from './config/sequelize.config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { KarmaEventModule } from './karma_event/karma_event.module';
import { BullModule } from '@nestjs/bullmq';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getSequelizeConfig(configService),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';

        return {
          connection: isProduction
            ? {
                // Redis Cloud: Use the full URL (e.g. redis://default:password@host:port)
                url: configService.get<string>('REDIS_URL'),
              }
            : {
                // Local Redis for development
                host: configService.get<string>('REDIS_HOST', 'localhost'),
                port: configService.get<number>('REDIS_PORT', 6379),
              },
        };
      },
    }),
    EventEmitterModule.forRoot(), // for listening to events
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration available globally
      envFilePath: '.env', // Path to your environment variables file
      ignoreEnvFile: false, // Set to true if you want to ignore the .env
    }),
    KarmaEventModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
