import { Module } from '@nestjs/common';
import { KarmaEventController } from './karma_event.controller';
import { KarmaEventService } from './karma_event.service';

@Module({
  controllers: [KarmaEventController],
  providers: [KarmaEventService],
})
export class KarmaEventModule {}
