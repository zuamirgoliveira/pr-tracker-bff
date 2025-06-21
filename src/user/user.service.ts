import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly http: HttpService) {}

  async getUser(authHeader: string): Promise<UserDto> {
    if (!authHeader) {
      throw new HttpException('Authorization header não informado', 400);
    }

    try {
      const resp$ = this.http.get<UserDto>('/api/v1/user', {
        headers: { Authorization: authHeader },
      });
      const { data } = await lastValueFrom(resp$);
      return data;
    } catch {
      throw new HttpException('Erro ao buscar usuário no backend', 502);
    }
  }
}
