import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from 'src/users/users.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { Suggestion } from './suggestion.model';
import { AiService } from 'src/karma_event/gemini.service';
import { BullModule } from '@nestjs/bullmq';
import { QueueNames } from 'src/config/queues';
import { SuggestionsProcessor } from './suggestions.processor';
import { KarmaEvent } from 'src/karma_event/karma_event.model';
@Module({
  imports: [
    SequelizeModule.forFeature([User, Suggestion, KarmaEvent]),
    BullModule.registerQueue({
      name: QueueNames.KARMA_SUGGESTION,
    }),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, AiService, SuggestionsProcessor],
})
export class DashboardModule {}
