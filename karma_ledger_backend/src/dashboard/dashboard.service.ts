import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Op, fn, col } from 'sequelize';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Suggestion } from './models/suggestion.model';
import { KarmaEvent } from 'src/karma_event/models/karma_event.model';
import { User } from 'src/users/models/users.model';
import { QueueNames } from 'src/config/queues';
import { BadgeEvents } from 'src/config/events';
import { Badge } from './models/badge.model';
import { UserBadge } from 'src/users/models/user_badges.model';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Suggestion)
    private readonly suggestionRepo: typeof Suggestion,

    @InjectModel(KarmaEvent)
    private readonly karmaEventRepo: typeof KarmaEvent,

    @InjectModel(User)
    private readonly userRepo: typeof User,

    @InjectModel(UserBadge) private readonly userBadgeRepo: typeof UserBadge,

    @InjectQueue(QueueNames.KARMA_SUGGESTION)
    private readonly suggestionQueue: Queue,

    private eventEmitter: EventEmitter2,

    @InjectModel(Badge) private readonly badgeRepo: typeof Badge,
  ) {}

  /** Fetch all suggestions for a given user, most recent first */
  async getSuggestions(userId: string): Promise<Suggestion[]> {
    return this.suggestionRepo.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });
  }

  /** Manually create a suggestion for a user */
  async createSuggestion(userId: string, content: string): Promise<Suggestion> {
    const suggestion = await this.suggestionRepo.create({
      user_id: userId,
      suggestion_text: content,
    });

    return suggestion;
  }

  /** Trigger background job to process weekly suggestions for a user */
  async triggerSuggestionProcessing(userId: string) {
    const user = await this.userRepo.findByPk(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    const week = this.getWeekSinceJoin(user.createdAt);

    return await this.suggestionQueue.add('get_suggestions', {
      userId,
      week,
    });
  }

  /** Calculates how many weeks have passed since the user joined */
  private getWeekSinceJoin(joinedAt: Date): number {
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - joinedAt.getTime()) / 86400000,
    );
    return Math.max(1, Math.ceil(diffDays / 7));
  }

  /** Get weekly karma scores since user joined, normalized to 0–100 */
  // async getWeeklyKarmaScores(userId: string) {
  //   const user = await this.userRepo.findByPk(userId);
  //   if (!user) throw new Error(`User ${userId} not found`);

  //   const joinDate = new Date(user.createdAt);
  //   const totalWeeks = this.getWeekSinceJoin(joinDate);
  //   const weeklyScores: { week: number; score: string }[] = [];

  //   for (let week = 1; week <= totalWeeks; week++) {
  //     const start = new Date(joinDate.getTime() + (week - 1) * 7 * 86400000);
  //     const end = new Date(start.getTime() + 6 * 86400000);

  //     const events = await this.karmaEventRepo.findAll({
  //       where: {
  //         user_id: userId,
  //         occurred_at: { [Op.between]: [start, end] },
  //       },
  //     });

  //     const avgIntensity = events.length
  //       ? events.reduce((sum, e) => sum + (e.intensity || 0), 0) / events.length
  //       : null;

  //     const score =
  //       avgIntensity !== null
  //         ? Math.round(((avgIntensity - -1) / 11) * 100)
  //         : 0;

  //     weeklyScores.push({ week, score: `${score}%` });
  //   }

  //   return weeklyScores;
  // }
  async getWeeklyKarmaScores(userId: string) {
    const user = await this.userRepo.findByPk(userId, {
      attributes: ['createdAt'],
    });
    if (!user) throw new Error(`User ${userId} not found`);

    const allEvents = await this.karmaEventRepo.findAll({
      where: { user_id: userId },
      order: [['occurred_at', 'ASC']],
      attributes: ['intensity', 'occurred_at'],
    });

    if (allEvents.length === 0) return [];

    // Group events by week in code, which is much faster than multiple DB calls
    const weeklyGroups: { [week: number]: number[] } = {};
    const joinDate = new Date(user.createdAt);

    for (const event of allEvents) {
      const diffDays = Math.floor(
        (new Date(event.occurred_at).getTime() - joinDate.getTime()) / 86400000,
      );
      const week = Math.max(1, Math.ceil(diffDays / 7));
      if (!weeklyGroups[week]) {
        weeklyGroups[week] = [];
      }
      weeklyGroups[week].push(event.intensity || 0);
    }

    const weeklyScores: { week: number; score: string }[] = [];
    for (const week in weeklyGroups) {
      const intensities = weeklyGroups[week];
      const avgIntensity =
        intensities.reduce((sum, i) => sum + i, 0) / intensities.length;
      const score = Math.round(((avgIntensity - -1) / 11) * 100);
      weeklyScores.push({ week: parseInt(week), score: `${score}%` });
    }

    return weeklyScores;
  }

  /** Returns top 10 users by average karma score for their current week */
  /**
   * [PRODUCTION-READY] Returns the top 10 users by average karma score for their current week.
   * This implementation is database-agnostic and avoids the N+1 query problem, making it
   * suitable for production environments like PostgreSQL.
   */
  async getWeeklyLeaderboard(): Promise<
    { userId: string; username: string; score: number }[]
  > {
    // 1. Fetch all users with only the necessary fields. This is a simple, portable query.
    const users = await this.userRepo.findAll({
      attributes: ['user_id', 'username', 'createdAt'],
      raw: true,
    });

    if (users.length === 0) {
      return [];
    }

    // 2. In Node.js (universally), calculate the current week's date range for each user.
    const userWeekRanges = users.map((user) => {
      const joinDate = new Date(user.createdAt);
      const currentWeekNumber = this.getWeekSinceJoin(joinDate);
      const start = new Date(
        joinDate.getTime() + (currentWeekNumber - 1) * 7 * 86400000,
      );
      const end = new Date(start.getTime() + 7 * 86400000);
      return {
        userId: user.user_id,
        username: user.username,
        start,
        end,
      };
    });

    // 3. Build a single, powerful aggregation query using Sequelize's portable operators.
    // Sequelize will translate this into the correct SQL for PostgreSQL, SQLite, etc.
    const userScores = (await this.karmaEventRepo.findAll({
      attributes: [
        'user_id',
        // fn('AVG', ...) is translated to AVG(...) in SQL by Sequelize.
        [fn('AVG', col('intensity')), 'avg_intensity'],
      ],
      raw: true,
      where: {
        // [Op.or] creates a chain of conditions, which is standard SQL.
        [Op.or]: userWeekRanges.map((range) => ({
          user_id: range.userId,
          // [Op.between] is translated to `... BETWEEN ... AND ...`, which is standard SQL.
          occurred_at: {
            [Op.between]: [range.start, range.end],
          },
        })),
      },
      group: ['user_id'], // GROUP BY is standard SQL.
    })) as unknown as { user_id: string; avg_intensity: number | null }[]; // avg can be null if no events found

    // 4. Map the aggregated scores back to usernames and normalize the score.
    const leaderboard = userScores.map((score) => {
      const user = users.find((u) => u.user_id === score.user_id);
      // Handle the case where a user has no events, resulting in a null average.
      const avg =
        score.avg_intensity === null ? 0 : Number(score.avg_intensity);

      // The normalization logic is standard math, independent of the database.
      const normalizedScore = Math.round(((avg - -1) / 11) * 100);

      return {
        userId: score.user_id,
        username: user?.username ?? 'Unknown',
        score: normalizedScore,
      };
    });

    // Sort descending by score. This is a standard JavaScript array sort.
    leaderboard.sort((a, b) => b.score - a.score);

    const top10 = leaderboard.slice(0, 10);

    // Emit event for each top 10 finisher.
    for (const topUser of top10) {
      this.eventEmitter.emit(BadgeEvents.TOP10_RANKED, {
        userId: topUser.userId,
      });
    }

    return top10;
  }

  async getAllBadges(): Promise<Badge[]> {
    return this.badgeRepo.findAll();
  }

  async getUserBadges(userId: string) {
    const userBadgeRecords = await this.userBadgeRepo.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Badge,
          where: { is_active: true },
          attributes: ['badge_id', 'code', 'name', 'description', 'icon'],
        },
      ],
    });
    return userBadgeRecords;
  }
}
