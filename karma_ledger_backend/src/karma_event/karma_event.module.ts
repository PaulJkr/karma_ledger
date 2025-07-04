import { Module } from '@nestjs/common';
import { KarmaEventController } from './karma_event.controller';
import { KarmaEventService } from './karma_event.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/users/users.model';
import { KarmaEvent } from './karma_event.model';
import { BullModule } from '@nestjs/bullmq';
import { QueueNames } from 'src/config/queues';
import { KarmaFeedbackProcessor } from './karma-feedback.processor';
import { AiService } from './gemini.service';

@Module({
  imports: [
    SequelizeModule.forFeature([User, KarmaEvent]),
    BullModule.registerQueue({
      name: QueueNames.KARMA_FEEDBACK,
    }),
  ],
  controllers: [KarmaEventController],
  providers: [KarmaEventService, KarmaFeedbackProcessor, AiService],
})
export class KarmaEventModule {}
