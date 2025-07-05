import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from 'src/users/models/users.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { Suggestion } from './models/suggestion.model';
import { AiService } from 'src/karma_event/gemini.service';
import { BullModule } from '@nestjs/bullmq';
import { QueueNames } from 'src/config/queues';
import { SuggestionsProcessor } from './suggestions.processor';
import { KarmaEvent } from 'src/karma_event/models/karma_event.model';
import { BadgeSeeder } from './models/seeders';
import { Badge } from './models/badge.model';
import { BadgeService } from './badge.service';
import { UserBadge } from 'src/users/models/user_badges.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Suggestion,
      KarmaEvent,
      Badge,
      UserBadge,
    ]),
    BullModule.registerQueue({
      name: QueueNames.KARMA_SUGGESTION,
    }),
    // register the badge_event queue
    BullModule.registerQueue({
      name: QueueNames.BADGE_EVENT,
    }),
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    AiService,
    SuggestionsProcessor,
    BadgeSeeder,
    BadgeService,
  ],
  exports: [BadgeService],
})
export class DashboardModule {}
