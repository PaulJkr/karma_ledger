import { Injectable } from '@nestjs/common';
import { KarmaEvent } from './karma_event.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateKarmaEventDto } from './dto/event.dto';
import { Sequelize } from 'sequelize-typescript';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QueueNames } from 'src/config/queues';

@Injectable()
export class KarmaEventService {
  constructor(
    @InjectModel(KarmaEvent) private karmaEventModel: typeof KarmaEvent,
    @InjectQueue(QueueNames.KARMA_FEEDBACK) private karmaFeedbackQueue: Queue,
  ) {}

  async createEvent(
    dto: CreateKarmaEventDto,
    userId: string,
  ): Promise<KarmaEvent> {
    const results = await this.karmaEventModel.create({
      ...dto,
      user_id: userId,
      occurred_at: dto.occurred_at || new Date(),
    });
    await this.karmaFeedbackQueue.add('get_feedback', {
      userId,
      karmaEventId: results.event_id,
      action: results.action,
    });
    return results;
  }

  async findUserEvents(userId: string): Promise<KarmaEvent[]> {
    return this.karmaEventModel.findAll({
      where: { user_id: userId },
      order: [['occurred_at', 'DESC']],
    });
  }

  async getUserKarmaScore(userId: string): Promise<number> {
    const MIN_INTENSITY = -1;
    const MAX_INTENSITY = 10;
    const results = await this.karmaEventModel.findAll({
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('intensity')), 'averageIntensity'],
      ],
      group: ['user_id'],
      where: { user_id: userId },
    });
    const firstResult = results[0];
    const averageIntensity = firstResult?.get('averageIntensity');

    if (averageIntensity === undefined || averageIntensity === null) return 0;

    // Normalize to percentage
    const normalized =
      (Number(averageIntensity) - MIN_INTENSITY) /
      (MAX_INTENSITY - MIN_INTENSITY);
    return Math.round(normalized * 100);
  }

  async updateKarmaEvent(
    eventId: string,
    updateData: Partial<KarmaEvent>,
  ): Promise<KarmaEvent> {
    const event = await this.karmaEventModel.findByPk(eventId);
    if (!event) {
      throw new Error(`Karma event with ID ${eventId} not found`);
    }
    return event.update(updateData);
  }
}
