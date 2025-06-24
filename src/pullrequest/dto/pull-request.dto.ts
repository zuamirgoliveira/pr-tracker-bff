import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';
import { PullRequestUserDto } from './pull-request-user-dto';

export class PullRequestDto {

  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  htmlUrl: string;

  @IsString()
  @ApiProperty()
  state: string;

  @IsDate()
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  user: PullRequestUserDto;
  
}