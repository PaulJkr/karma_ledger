import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateKarmaEventDto } from './dto/event.dto';
import { KarmaEventService } from './karma_event.service';
import { AuthenticatedRequest } from 'src/util/types';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { handleError } from 'src/util/error';
@Controller('karma-events')
@UseGuards(JwtAuthGuard)
export class KarmaEventController {
  constructor(private readonly karmaEventService: KarmaEventService) {}

  @Post('create')
  logEvent(
    @Body() dto: CreateKarmaEventDto,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      return this.karmaEventService.createEvent(dto, req.user?.user_id ?? '');
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: handleError(error),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('me')
  getUserEvents(@Request() req: AuthenticatedRequest) {
    try {
      return this.karmaEventService.findUserEvents(req.user?.user_id ?? '');
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: handleError(error),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('me/score')
  getUserKarmaScore(@Request() req: AuthenticatedRequest) {
    try {
      const results = this.karmaEventService.getUserKarmaScore(
        req.user?.user_id ?? '',
      );
      return {
        total_score: results,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: handleError(error),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
