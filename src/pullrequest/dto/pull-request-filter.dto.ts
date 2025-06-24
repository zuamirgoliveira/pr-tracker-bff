/* eslint-disable prettier/prettier */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum State {
  ALL = 'all',
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum Direction {
  ASC = 'asc',
  DESC = 'desc',
}

export class PullRequestFilterDto {
  @ApiPropertyOptional({ enum: State, default: State.ALL })
  @IsEnum(State)
  @IsOptional()
  state?: State = State.ALL;

  @ApiPropertyOptional({ enum: Direction, default: Direction.DESC })
  @IsEnum(Direction)
  @IsOptional()
  direction?: Direction = Direction.DESC;
}
