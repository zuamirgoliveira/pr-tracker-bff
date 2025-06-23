// src/pulls/pull-request.controller.spec.ts
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PullRequestController } from './pull-request.controller';
import { PullRequestService } from './pull-request.service';
import { PullRequestDto } from './dto/pull-request.dto';
import { PullRequestFilterDto, State } from './dto/pull-request-filter.dto';
import { HttpException } from '@nestjs/common';

describe('PullRequestController', () => {
  let controller: PullRequestController;
  let service: PullRequestService;

  const fakePulls: PullRequestDto[] = [
    {
      title: 'Add new feature',
      htmlUrl: 'https://github.com/foo/bar/pull/1',
      state: State.OPEN,
      createdAt: new Date('2025-06-01T12:00:00Z'),
      user: { login: 'contributor', avatarUrl: 'https://avatars.github.com/u/1' },
    },
    {
      title: 'Fix bug',
      htmlUrl: 'https://github.com/foo/bar/pull/2',
      state: State.CLOSED,
      createdAt: new Date('2025-06-02T08:30:00Z'),
      user: { login: 'maintainer', avatarUrl: 'https://avatars.github.com/u/2' },
    },
  ];

  const defaultFilter = new PullRequestFilterDto(); // state=all, direction=desc

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PullRequestController],
      providers: [
        {
          provide: PullRequestService,
          useValue: { getPulls: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<PullRequestController>(PullRequestController);
    service = module.get<PullRequestService>(PullRequestService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPulls', () => {
    it('should return an array of PullRequestDto when service resolves', async () => {
      jest.spyOn(service, 'getPulls').mockResolvedValue(fakePulls);

      const result = await controller.getPulls(
        'Bearer token',
        'foo',
        'bar',
        defaultFilter,
      );

      expect(service.getPulls).toHaveBeenCalledWith(
        'Bearer token',
        'foo',
        'bar',
        defaultFilter,
      );
      expect(result).toEqual(fakePulls);
    });

    it('should throw BadRequest if Authorization header is missing', async () => {
      const err = new HttpException('Authorization header não informado', 400);
      jest.spyOn(service, 'getPulls').mockRejectedValue(err);

      await expect(
        controller.getPulls('', 'foo', 'bar', defaultFilter),
      ).rejects.toMatchObject({ status: 400 });
    });

    it('should throw BadGateway if service fails downstream', async () => {
      const err = new HttpException('Erro ao buscar Pull Requests no backend', 502);
      jest.spyOn(service, 'getPulls').mockRejectedValue(err);

      await expect(
        controller.getPulls('Bearer token', 'foo', 'bar', defaultFilter),
      ).rejects.toMatchObject({ status: 502 });
    });
  });
});