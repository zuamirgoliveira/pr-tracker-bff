import {
  Controller,
  Get,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Retorna perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil retornado', type: UserDto })
  @ApiResponse({ status: 400, description: 'Header Authorization ausente' })
  @ApiResponse({ status: 502, description: 'Erro de comunicação com backend' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getUser(
    @Headers('authorization') authorization: string,
  ): Promise<UserDto> {
    return this.userService.getUser(authorization);
  }
}
