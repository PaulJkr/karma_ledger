import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Badge } from '../badge.model';

@Injectable()
export class BadgeSeeder implements OnModuleInit {
  private readonly logger = new Logger(BadgeSeeder.name);

  constructor(@InjectModel(Badge) private readonly badgeRepo: typeof Badge) {}

  async onModuleInit() {
    await this.seedBadges();
  }

  async seedBadges() {
    const badges = [
      {
        code: 'first_action',
        name: 'First Steps',
        description: 'Created your first karma event',
        icon: '/icons/first-action.png',
      },
      {
        code: 'first_suggestion',
        name: 'Good Listener',
        description: 'Received your first AI suggestion',
        icon: '/icons/first-suggestion.png',
      },
      {
        code: 'karma_5',
        name: 'Karma Novice',
        description: 'Created 5 karma events',
        icon: '/icons/karma-5.png',
      },
      {
        code: 'weekly_checkin_3',
        name: 'Weekly Warrior',
        description: 'Logged karma for 3 different weeks',
        icon: '/icons/weekly-warrior.png',
      },
      {
        code: 'top10_leaderboard',
        name: 'Top 10 Finisher',
        description: 'Ranked top 10 this week',
        icon: '/icons/top-10.png',
      },
    ];

    for (const badge of badges) {
      const exists = await this.badgeRepo.findOne({
        where: { code: badge.code },
      });
      if (!exists) {
        await this.badgeRepo.create({ ...badge, is_active: true });
        this.logger.log(`Seeded badge: ${badge.name}`);
      } else {
        this.logger.debug(`Badge already exists: ${badge.code}`);
      }
    }
  }
}
