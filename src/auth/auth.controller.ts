import { Controller, Get, Query, Res, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GithubCallbackDto } from './dto/github-callback.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Get('github')
  @ApiOperation({ summary: 'Inicia OAuth com GitHub' })
  @ApiResponse({ status: 302, description: 'Redireciona para GitHub' })
  redirectToGithub(@Res() res: Response) {
    const url = this.auth.getGithubAuthUrl();
    if (!url) {
      throw new HttpException('URL de autenticação não configurada', 500);
    }
    return res.redirect(url);
  }

  @Get('github/callback')
  @ApiOperation({ summary: 'Callback GitHub OAuth' })
  @ApiResponse({ status: 302, description: 'Redireciona para front e seta cookie' })
  async handleCallback(
    @Query() dto: GithubCallbackDto,
    @Res() res: Response,
  ) {
    if (!dto.code) {
      throw new HttpException('Código ausente', 400);
    }
    const token = await this.auth.exchangeCodeForToken(dto.code);
    res.cookie('GH_TOKEN', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });
    const frontendUrl = this.auth['cfg'].get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      throw new HttpException('FRONTEND_URL não configurada', 500);
    }
    return res.redirect(frontendUrl);
  }
}
