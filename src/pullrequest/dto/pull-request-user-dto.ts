import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PullRequestUserDto {
  @IsString()
  @ApiProperty({ description: 'Usuário (login no GitHub)' })
  login: string;

  @IsString()
  @ApiProperty({ description: 'URL do avatar' })
  avatarUrl: string;
}
