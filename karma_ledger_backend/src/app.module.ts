import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dbConfig } from './config/sequelize.config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { KarmaEventModule } from './karma_event/karma_event.module';
import { BullModule } from '@nestjs/bullmq';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    SequelizeModule.forRoot(dbConfig),
    BullModule.forRoot({
      // Global configuration for BullMQ
      connection: {
        host: 'localhost',
        port: 5000,
      },
    }),
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
