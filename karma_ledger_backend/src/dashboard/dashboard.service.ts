import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Op } from 'sequelize';

import { Suggestion } from './suggestion.model';
import { KarmaEvent } from 'src/karma_event/karma_event.model';
import { User } from 'src/users/users.model';
import { QueueNames } from 'src/config/queues';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Suggestion)
    private readonly suggestionRepo: typeof Suggestion,

    @InjectModel(KarmaEvent)
    private readonly karmaEventRepo: typeof KarmaEvent,

    @InjectModel(User)
    private readonly userRepo: typeof User,

    @InjectQueue(QueueNames.KARMA_SUGGESTION)
    private readonly suggestionQueue: Queue,
  ) {}

  /**
   * Fetch all suggestions for a given user, most recent first.
   */
  async getSuggestions(userId: string): Promise<Suggestion[]> {
    return this.suggestionRepo.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Manually create a suggestion for a user.
   */
  async createSuggestion(userId: string, content: string): Promise<Suggestion> {
    return this.suggestionRepo.create({
      user_id: userId,
      suggestion_text: content,
    });
  }

  /**
   * Trigger background job to process weekly suggestions for a user.
   */
  async triggerSuggestionProcessing(userId: string) {
    const user = await this.userRepo.findByPk(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    const week = this.getWeekSinceJoin(user.createdAt);

    return await this.suggestionQueue.add('get_suggestions', {
      userId,
      week,
    });
  }

  /**
   * Get weekly karma scores since user joined, normalized to 0–100.
   */
  async getWeeklyKarmaScores(userId: string) {
    const user = await this.userRepo.findByPk(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    const joinDate = new Date(user.createdAt);
    const totalWeeks = this.getWeekSinceJoin(joinDate);

    const weeklyScores: { week: number; score: string }[] = [];

    for (let week = 1; week <= totalWeeks; week++) {
      const start = new Date(joinDate.getTime() + (week - 1) * 7 * 86400000);
      const end = new Date(start.getTime() + 6 * 86400000);

      const events = await this.karmaEventRepo.findAll({
        where: {
          user_id: userId,
          occurred_at: { [Op.between]: [start, end] },
        },
      });

      const avgIntensity = events.length
        ? events.reduce((sum, e) => sum + (e.intensity || 0), 0) / events.length
        : null;

      const score =
        avgIntensity !== null
          ? Math.round(((avgIntensity - -1) / 11) * 100) // Normalize from -1 to 10
          : 0;

      weeklyScores.push({ week, score: `${score}%` });
    }

    return weeklyScores;
  }

  /**
   * Calculates how many weeks have passed since the user joined.
   */
  private getWeekSinceJoin(joinedAt: Date): number {
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - joinedAt.getTime()) / 86400000,
    );
    return Math.max(1, Math.ceil(diffDays / 7));
  }
}
