import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Suggestion } from './suggestion.model';
import { InjectQueue } from '@nestjs/bullmq';
import { QueueNames } from 'src/config/queues';
import { Queue } from 'bullmq';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Suggestion) private readonly suggestionRepo: typeof Suggestion,
    @InjectQueue(QueueNames.KARMA_SUGGESTION)
    private suggestionQueue: Queue,
  ) {}
  async getSuggestions(userId: string): Promise<Suggestion[]> {
    return this.suggestionRepo.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });
  }

  async createSuggestion(userId: string, content: string): Promise<Suggestion> {
    return this.suggestionRepo.create({
      user_id: userId,
      suggestion_text: content,
    });
  }

  async triggerSuggestionProcessing(userId: string) {
    return await this.suggestionQueue.add('get_suggestions', {
      userId,
      week: this.getWeekSinceJoin(new Date()),
    });
  }

  private getWeekSinceJoin(joinedAt: Date): number {
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - joinedAt.getTime()) / 86400000,
    );
    return Math.max(1, Math.ceil(diffDays / 7));
  }
}
