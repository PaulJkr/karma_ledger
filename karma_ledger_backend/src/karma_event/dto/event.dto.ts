// src/karma-events/dto/create-karma-event.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateKarmaEventDto {
  @ApiProperty({
    description: "The user's action",
    example: 'Played golf',
  })
  @IsString()
  action: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "The user's reflection",
    example: 'i really enjoyed',
  })
  reflection?: string;

  @IsDateString()
  @IsOptional()
  occurred_at?: string; // optional; default is now
}
