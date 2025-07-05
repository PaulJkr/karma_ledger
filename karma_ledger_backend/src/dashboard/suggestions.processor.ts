import { WorkerHost, Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Suggestion } from './models/suggestion.model';
import { KarmaEvent } from 'src/karma_event/models/karma_event.model';
import { AiService } from 'src/karma_event/gemini.service';
import { User } from 'src/users/models/users.model';
import { QueueNames } from 'src/config/queues';
import { Logger } from '@nestjs/common';
import { handleError } from 'src/util/error';
import { BadgeEvents } from 'src/config/events';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Processor(QueueNames.KARMA_SUGGESTION)
export class SuggestionsProcessor extends WorkerHost {
  private readonly logger = new Logger('Suggestions_processing');

  constructor(
    @InjectModel(KarmaEvent)
    private readonly karmaEventRepo: typeof KarmaEvent,

    @InjectModel(Suggestion)
    private readonly suggestionRepo: typeof Suggestion,

    @InjectModel(User)
    private readonly userRepo: typeof User,

    private readonly aiService: AiService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<{ userId: string; week: number }>) {
    const { userId, week } = job.data;
    this.logger.log(`Generating suggestions for user ${userId}, week ${week}`);

    try {
      const user = await this.userRepo.findByPk(userId);
      if (!user) throw new Error(`User ${userId} not found.`);

      // Calculate user's week range from signup date
      const { start, end } = this.getWeekFromJoinDate(user.createdAt, week);

      const events = await this.karmaEventRepo.findAll({
        where: {
          user_id: userId,
          occurred_at: {
            [Op.between]: [start, end],
          },
        },
        order: [['occurred_at', 'DESC']],
      });

      const suggestions = await this.aiService.generateWeeklySuggestions(
        userId,
        events,
      );

      this.logger.warn(
        `Cleared old suggestions for user ${userId} week ${week}`,
      );

      const existingCount = await this.suggestionRepo.count({
        where: { user_id: userId },
      });

      // delete prev suggestions for the same week- (duplicate)
      await this.suggestionRepo.destroy({
        where: {
          user_id: userId,
          week,
        },
      });

      const created = await this.suggestionRepo.bulkCreate(
        suggestions.map((text) => ({
          user_id: userId,
          suggestion_text: text,
          week,
          used: false,
          created_at: new Date(),
        })),
      );
      if (existingCount === 0 && created.length > 0) {
        this.eventEmitter.emit(BadgeEvents.FIRST_SUGGESTION, { userId });
      }

      this.logger.log(
        `Saved ${suggestions.length} suggestions for user ${userId} (week ${week})`,
      );
    } catch (err) {
      this.logger.error(handleError(err));
    }
  }

  /**
   * Given a user's signup date and current app week number,
   * returns the real date range (start and end) for that user's personal week.
   */
  private getWeekFromJoinDate(
    joinedAt: Date,
    weekOffset: number,
  ): { start: Date; end: Date } {
    const joined = new Date(joinedAt);
    const start = new Date(joined.getTime() + (weekOffset - 1) * 7 * 86400000);
    const end = new Date(start.getTime() + 6 * 86400000);
    return { start, end };
  }
}
