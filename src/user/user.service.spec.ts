// test/unit/user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { UserService } from '../../src/user/user.service';
import { UserDto } from '../../src/user/dto/user.dto';
import { HttpException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(UserService);
    httpService = module.get(HttpService);
  });

  it('should throw on missing Authorization header', async () => {
    await expect(service.getUser('')).rejects.toThrow(HttpException);
  });

  it('should return user data when backend responds', async () => {
    const dto: UserDto = {
      login: 'teste',
      name: 'Teste teste',
      avatarUrl: 'http://avatar.url',
      email: 'teste@example.com',
    };
    jest.spyOn(httpService, 'get').mockReturnValue(of({ data: dto } as any));
    await expect(service.getUser('Bearer token')).resolves.toEqual(dto);
  });

  it('should throw Bad Gateway on downstream error', async () => {
    jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => new Error('fail')));
    await expect(service.getUser('Bearer token')).rejects.toThrow(HttpException);
  });
});