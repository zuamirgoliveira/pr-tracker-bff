import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { RepoDto } from './dto/repo.dto';
import { RepoFilterDto } from './dto/repo-filter.dto';

@Injectable()
export class RepositoryService {
  constructor(private readonly http: HttpService) {}

  async getUserRepos(authHeader: string, filter: RepoFilterDto): Promise<RepoDto[]> {
    if (!authHeader) {
      throw new HttpException('Authorization header não informado', 400);
    }

    try {
      const resp$ = this.http.get<RepoDto[]>('/api/v1/user/repos', {
        headers: { Authorization: authHeader },
        params: {
            type: filter.type,
            sort: filter.sort,
            direction: filter.direction,
            perPage: filter.perPage,
            page: filter.page,
        },
      });
      const { data } = await lastValueFrom(resp$);
      return data;
    } catch (err) {
      throw new HttpException(
        'Erro ao buscar repositórios no backend',
        502,
      );
    }
  }
}