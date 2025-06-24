import {
  Controller, Get, Headers, Param, Query, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PullRequestService } from './pull-request.service';
import { PullRequestDto } from './dto/pull-request.dto';
import { PullRequestFilterDto } from './dto/pull-request-filter.dto';

@ApiTags('pulls')
@Controller('repos/:owner/:repo/pulls')
export class PullRequestController {
  constructor(private readonly pullRequestService: PullRequestService) {}

  @Get()
  @ApiOperation({ summary: 'Lista Pull Requests de um repositório' })
  @ApiResponse({ status: 200, type: [PullRequestDto] })
  @ApiResponse({ status: 400, description: 'Header ou params inválidos' })
  @ApiResponse({ status: 502, description: 'Erro de backend' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getPulls(
    @Headers('authorization') auth: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query() filter: PullRequestFilterDto,
  ): Promise<PullRequestDto[]> {
    return this.pullRequestService.getPulls(auth, owner, repo, filter);
  }
}