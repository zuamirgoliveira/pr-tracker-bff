import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UserDto {
    
    @IsString()
    @ApiProperty({ description: 'Usuário (login no GitHub)' })
    login: string;

    @IsString()
    @ApiProperty({ description: 'Nome do usuário' })
    name: string;

    @IsString()
    @ApiProperty({ description: 'URL do avatar' })
    avatarUrl: string;

    @IsEmail()
    @ApiProperty({ description: 'E-mail do usuário' })
    email: string;
}