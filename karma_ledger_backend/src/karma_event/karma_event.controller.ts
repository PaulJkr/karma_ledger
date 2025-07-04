import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { CreateKarmaEventDto } from './dto/event.dto';
import { KarmaEventService } from './karma_event.service';
import { AuthenticatedRequest } from 'src/util/types';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
@Controller('karma-events')
@UseGuards(JwtAuthGuard)
export class KarmaEventController {
  constructor(private readonly karmaEventService: KarmaEventService) {}

  @Post('create')
  logEvent(
    @Body() dto: CreateKarmaEventDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.karmaEventService.createEvent(dto, req.user?.user_id ?? '');
  }

  @Get('me')
  getUserEvents(@Request() req: AuthenticatedRequest) {
    return this.karmaEventService.findUserEvents(req.user?.user_id ?? '');
  }

  @Get('me/score')
  getUserKarmaScore(@Request() req: AuthenticatedRequest) {
    return this.karmaEventService.getUserKarmaScore(req.user?.user_id ?? '');
  }
}
