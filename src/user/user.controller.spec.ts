// src/user/user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { HttpException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const fakeUser: UserDto = {
    login: 'testuser',
    name: 'Test User',
    avatarUrl: 'http://example.com/avatar.png',
    email: 'testuser@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should return user data when service resolves', async () => {
      jest.spyOn(service, 'getUser').mockResolvedValue(fakeUser);

      const result = await controller.getUser('Bearer faketoken');
      expect(service.getUser).toHaveBeenCalledWith('Bearer faketoken');
      expect(result).toEqual(fakeUser);
    });

    it('should throw BadRequest if Authorization header is missing', async () => {
      // mock para simular throw no service
      const err = new HttpException('Authorization header não informado', 400);
      jest.spyOn(service, 'getUser').mockRejectedValue(err);

      await expect(controller.getUser('')).rejects.toThrow(HttpException);
      await expect(controller.getUser('')).rejects.toMatchObject({ status: 400 });
    });

    it('should throw BadGateway if service fails downstream', async () => {
      const err = new HttpException('Erro ao buscar usuário no backend', 502);
      jest.spyOn(service, 'getUser').mockRejectedValue(err);

      await expect(controller.getUser('Bearer faketoken')).rejects.toThrow(HttpException);
      await expect(controller.getUser('Bearer faketoken')).rejects.toMatchObject({ status: 502 });
    });
  });
});