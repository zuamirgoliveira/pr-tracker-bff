import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum RepoType {
  ALL = 'all',
  OWNER = 'owner',
  MEMBER = 'member',
}

export enum SortField {
  CREATED = 'created',
  UPDATED = 'updated',
  PUSHED = 'pushed',
  FULL_NAME = 'full_name',
}

export enum Direction {
  ASC = 'asc',
  DESC = 'desc',
}

export class RepoFilterDto {
  @ApiPropertyOptional({ enum: RepoType, default: RepoType.ALL })
  @IsEnum(RepoType)
  @IsOptional()
  type?: RepoType = RepoType.ALL;

  @ApiPropertyOptional({ enum: SortField, default: SortField.CREATED })
  @IsEnum(SortField)
  @IsOptional()
  sort?: SortField = SortField.CREATED;

  @ApiPropertyOptional({ enum: Direction, default: Direction.DESC })
  @IsEnum(Direction)
  @IsOptional()
  direction?: Direction = Direction.DESC;

  @ApiPropertyOptional({ default: 30, description: 'itens por página' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  perPage?: number = 30;

  @ApiPropertyOptional({ default: 1, description: 'número da página' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;
}
