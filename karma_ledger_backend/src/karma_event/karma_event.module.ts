import { Module } from '@nestjs/common';
import { KarmaEventController } from './karma_event.controller';
import { KarmaEventService } from './karma_event.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/users/models/users.model';
import { KarmaEvent } from './models/karma_event.model';
import { BullModule } from '@nestjs/bullmq';
import { QueueNames } from 'src/config/queues';
import { KarmaFeedbackProcessor } from './karma-feedback.processor';
import { AiService } from './gemini.service';
import { BadgeListener } from './listeners/badge.listener';
import { DashboardModule } from 'src/dashboard/dashboard.module';

@Module({
  imports: [
    DashboardModule,
    SequelizeModule.forFeature([User, KarmaEvent]),
    BullModule.registerQueue({
      name: QueueNames.KARMA_FEEDBACK,
    }),
  ],
  controllers: [KarmaEventController],
  providers: [
    KarmaEventService,
    KarmaFeedbackProcessor,
    AiService,
    BadgeListener,
  ],
})
export class KarmaEventModule {}
