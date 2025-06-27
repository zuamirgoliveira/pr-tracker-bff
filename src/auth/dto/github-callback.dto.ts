import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GithubCallbackDto {
  @ApiProperty({ description: 'Código de autorização retornado pelo GitHub' })
  @IsString()
  code: string;
}