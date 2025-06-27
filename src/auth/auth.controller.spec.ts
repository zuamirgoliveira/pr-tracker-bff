/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService }    from './auth.service';
import { GithubCallbackDto } from './dto/github-callback.dto';
import { HttpException }  from '@nestjs/common';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let res: Partial<Response>;

  beforeEach(async () => {
    const mockService = {
      getGithubAuthUrl: jest.fn().mockReturnValue('http://github.com/auth'),
      exchangeCodeForToken: jest.fn().mockResolvedValue('tok-123'),
      cfg: { get: jest.fn().mockImplementation(key => key === 'FRONTEND_URL' ? 'http://frontend' : undefined) },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockService },
      ],
    }).compile();

    controller = module.get(AuthController);
    service = module.get(AuthService);

    res = {
      redirect: jest.fn().mockReturnThis(),
      cookie:   jest.fn().mockReturnThis(),
    };
  });

  describe('redirectToGithub', () => {
    it('should redirect to the URL returned by AuthService', () => {
      controller.redirectToGithub(res as Response);
      expect(service.getGithubAuthUrl).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('http://github.com/auth');
    });

    it('should throw if service returns empty URL', () => {
      jest.spyOn(service, 'getGithubAuthUrl').mockReturnValue('');
      expect(() => controller.redirectToGithub(res as Response))
        .toThrow(HttpException);
    });
  });

  describe('handleCallback', () => {
    const dto: GithubCallbackDto = { code: 'abc' };

    it('should throw 400 if code is missing', async () => {
      await expect(
        controller.handleCallback({} as any, res as Response),
      ).rejects.toThrow(HttpException);
    });

    it('should set cookie and redirect on success', async () => {
      await controller.handleCallback(dto, res as Response);
      expect(service.exchangeCodeForToken).toHaveBeenCalledWith('abc');
      expect(res.cookie).toHaveBeenCalledWith(
        'GH_TOKEN',
        'tok-123',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        }),
      );
      expect(res.redirect).toHaveBeenCalledWith('http://frontend');
    });

    it('should throw if FRONTEND_URL is not set', async () => {
      (service as any).cfg.get = () => undefined;
      await expect(
        controller.handleCallback(dto, res as Response),
      ).rejects.toThrow(HttpException);
    });
  });
});