import { Module } from '@nestjs/common';
import { KarmaEventController } from './karma_event.controller';
import { KarmaEventService } from './karma_event.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/users/users.model';
import { KarmaEvent } from './karma_event.model';

@Module({
  imports: [SequelizeModule.forFeature([User, KarmaEvent])],
  controllers: [KarmaEventController],
  providers: [KarmaEventService],
})
export class KarmaEventModule {}
