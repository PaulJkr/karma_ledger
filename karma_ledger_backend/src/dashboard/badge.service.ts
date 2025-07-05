// src/badges/badge.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserBadge } from 'src/users/models/user_badges.model';
import { Badge } from './models/badge.model';

@Injectable()
export class BadgeService {
  private readonly logger = new Logger(BadgeService.name);

  constructor(
    @InjectModel(UserBadge) private userBadgeRepo: typeof UserBadge,
    @InjectModel(Badge) private badgeRepo: typeof Badge,
  ) {}

  async awardBadgeToUser(userId: string, badgeCode: string): Promise<void> {
    const badge = await this.badgeRepo.findOne({ where: { code: badgeCode } });
    if (!badge) {
      this.logger.warn(`Badge ${badgeCode} not found`);
      return;
    }

    const alreadyHas = await this.userBadgeRepo.findOne({
      where: { user_id: userId, badge_id: badge.badge_id },
    });

    if (alreadyHas) {
      this.logger.debug(`User ${userId} already has badge ${badgeCode}`);
      return;
    }

    await this.userBadgeRepo.create({
      user_id: userId,
      badge_id: badge.badge_id,
    });

    this.logger.log(`🎖️ Awarded badge "${badge.name}" to user ${userId}`);
  }
}
