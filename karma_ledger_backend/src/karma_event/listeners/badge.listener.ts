import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BadgeEvents, BadgeCode } from 'src/config/events';
import { BadgeService } from 'src/dashboard/badge.service';

@Injectable()
export class BadgeListener {
  constructor(private readonly badgeService: BadgeService) {}

  @OnEvent(BadgeEvents.FIRST_ACTION)
  async handleFirstAction({ userId }: { userId: string }) {
    await this.badgeService.awardBadgeToUser(userId, BadgeCode.FIRST_ACTION);
  }

  @OnEvent(BadgeEvents.FIRST_SUGGESTION)
  async handleFirstSuggestion({ userId }: { userId: string }) {
    await this.badgeService.awardBadgeToUser(
      userId,
      BadgeCode.FIRST_SUGGESTION,
    );
  }

  @OnEvent(BadgeEvents.KARMA_5)
  async handleKarma5({ userId }: { userId: string }) {
    await this.badgeService.awardBadgeToUser(userId, BadgeCode.KARMA_5);
  }

  @OnEvent(BadgeEvents.WEEKLY_CHECKIN_3)
  async handleWeeklyCheckin3({ userId }: { userId: string }) {
    await this.badgeService.awardBadgeToUser(
      userId,
      BadgeCode.WEEKLY_CHECKIN_3,
    );
  }

  @OnEvent(BadgeEvents.TOP10_RANKED)
  async handleTop10({ userId }: { userId: string }) {
    await this.badgeService.awardBadgeToUser(userId, BadgeCode.TOP10);
  }
}
