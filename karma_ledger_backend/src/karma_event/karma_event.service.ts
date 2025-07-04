import { Injectable } from '@nestjs/common';
import { KarmaEvent } from './karma_event.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateKarmaEventDto } from './dto/event.dto';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class KarmaEventService {
  constructor(
    @InjectModel(KarmaEvent) private karmaEventModel: typeof KarmaEvent,
  ) {}

  async createEvent(
    dto: CreateKarmaEventDto,
    userId: string,
  ): Promise<KarmaEvent> {
    const intensity = 5;

    return this.karmaEventModel.create({
      ...dto,
      user_id: userId,
      intensity: intensity,
      occurred_at: dto.occurred_at || new Date(),
    });
  }

  async findUserEvents(userId: string): Promise<KarmaEvent[]> {
    return this.karmaEventModel.findAll({
      where: { user_id: userId },
      order: [['occurred_at', 'DESC']],
    });
  }

  async getUserKarmaScore(userId: string) {
    const result = await this.karmaEventModel.findAll({
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('intensity')), 'totalKarma'],
      ],
      where: { user_id: userId },
    });

    if (result.length === 0 || !result[0].get('totalKarma')) {
      return 0;
    }

    return result[0].get('totalKarma');
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
