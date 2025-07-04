// src/karma-events/dto/create-karma-event.dto.ts

import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateKarmaEventDto {
  @IsString()
  action: string;

  @IsString()
  @IsOptional()
  reflection?: string;

  @IsDateString()
  @IsOptional()
  occurred_at?: string; // optional; default is now
}
