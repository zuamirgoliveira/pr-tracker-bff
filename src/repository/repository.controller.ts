import { Controller, Get, Headers, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RepositoryService } from './repository.service';
import { RepoDto } from './dto/repo.dto';
import { RepoFilterDto } from './dto/repo-filter.dto';

@ApiTags('repos')
@Controller('user/repos')
export class RepositoryController {
  constructor(private readonly reposService: RepositoryService) {}

  @Get()
  @ApiOperation({ summary: 'Lista repositórios do usuário autenticado' })
  @ApiResponse({ status: 200, type: [RepoDto] })
  @ApiResponse({ status: 400, description: 'Header ausente ou inválido' })
  @ApiResponse({ status: 502, description: 'Erro de backend' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getUserRepos(
    @Headers('authorization') authorization: string,
    @Query() query: RepoFilterDto,
  ): Promise<RepoDto[]> {
    return this.reposService.getUserRepos(authorization, query);
  }
}