import {
  Controller,
  Get,
  Headers,
  HttpException,
  UsePipes,
  ValidationPipe,
  Req,
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
    @Headers('authorization') authHeader: string,
    @Req() req: Request,
  ): Promise<UserDto> {
    const cookieToken = (req as any).cookies['GH_TOKEN'] as string | undefined;
    const authorization = authHeader?.trim()
      ? authHeader
      : cookieToken
      ? `Bearer ${cookieToken}`
      : undefined;
    if (!authorization) {
      throw new HttpException('Não autenticado (nenhum token encontrado)', 400);
    }
    return this.userService.getUser(authorization);
  }
}
