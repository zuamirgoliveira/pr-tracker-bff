/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService }    from './user.service';
import { UserDto }        from './dto/user.dto';
import { HttpException }  from '@nestjs/common';
import { Request }        from 'express';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const fakeUser: UserDto = {
    login: 'jdoe',
    name: 'John Doe',
    avatarUrl: 'http://avatar',
    email: 'jdoe@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUser: jest.fn().mockResolvedValue(fakeUser),
          },
        },
      ],
    }).compile();

    controller = module.get(UserController);
    service    = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('uses the Authorization header when present', async () => {
    const req = { cookies: { } } as unknown as Request;
    const result = await controller.getUser('Bearer token123', req as any);
    expect(service.getUser).toHaveBeenCalledWith('Bearer token123');
    expect(result).toEqual(fakeUser);
  });

  it('falls back to GH_TOKEN cookie when header is absent', async () => {
    const req = { cookies: { GH_TOKEN: 'ck-xyz' } } as unknown as Request;
    const result = await controller.getUser('', req as any);
    expect(service.getUser).toHaveBeenCalledWith('Bearer ck-xyz');
    expect(result).toEqual(fakeUser);
  });

  it('throws 400 if neither header nor cookie present', async () => {
    const req = { cookies: { } } as unknown as Request;
    await expect(controller.getUser('', req as any)).rejects.toThrow(HttpException);
    await expect(controller.getUser('', req as any))
      .rejects.toMatchObject({ status: 400, message: 'Não autenticado (nenhum token encontrado)' });
  });

  it('propagates service errors as-is', async () => {
    jest.spyOn(service, 'getUser').mockRejectedValue(new HttpException('Backend error', 502));
    const req = { cookies: { GH_TOKEN: 'ck-xyz' } } as unknown as Request;
    await expect(controller.getUser('', req as any)).rejects.toMatchObject({ status: 502, message: 'Backend error' });
  });
});
