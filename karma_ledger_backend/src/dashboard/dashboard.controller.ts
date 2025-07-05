import { Controller, Get, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AuthenticatedRequest } from 'src/util/types';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly DashboardService: DashboardService) {}

  @Get('/trigger-suggestions')
  async triggerSuggestions(@Request() req: AuthenticatedRequest) {
    return this.DashboardService.triggerSuggestionProcessing(
      req.user?.user_id ?? '',
    );
  }

  @Get('/suggestions')
  async getSuggestions(@Request() req: AuthenticatedRequest) {
    return this.DashboardService.getSuggestions(req.user?.user_id ?? '');
  }

  @Get('/karma-scores')
  async getKarmaScores(@Request() req: AuthenticatedRequest) {
    return this.DashboardService.getWeeklyKarmaScores(req.user?.user_id ?? '');
  }
}
