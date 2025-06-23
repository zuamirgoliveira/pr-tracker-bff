import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { PullRequestDto } from './dto/pull-request.dto';
import { PullRequestFilterDto } from './dto/pull-request-filter.dto';

@Injectable()
export class PullRequestService {
  constructor(private readonly http: HttpService) {}

  async getPulls(
    authHeader: string,
    owner: string,
    repo: string,
    filter: PullRequestFilterDto,
  ): Promise<PullRequestDto[]> {
    if (!authHeader) {
        throw new HttpException('Authorization header não informado', 400);
    }

    try {
      const resp$ = this.http.get<PullRequestDto[]>(
        `/api/v1/repos/${owner}/${repo}/pulls`, {
            headers: { Authorization: authHeader },
            params: {
                direction: filter.direction,
                state: filter.state,
            },
    });
      const { data } = await lastValueFrom(resp$);
      return data;
    } catch {
      throw new HttpException('Erro ao buscar Pull Requests no backend', 502);
    }
  }
}