/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PullRequestService } from './pull-request.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { PullRequestDto } from './dto/pull-request.dto';
import { PullRequestFilterDto, State, Direction} from './dto/pull-request-filter.dto';
import { AxiosResponse } from 'axios';

describe('PullRequestService', () => {
  let service: PullRequestService;
  let httpService: HttpService;

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

  const defaultFilter = new PullRequestFilterDto(); // defaults: state=all, direction=desc

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PullRequestService,
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PullRequestService>(PullRequestService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw 400 BadRequest if authHeader is missing', async () => {
    await expect(
      service.getPulls('', 'foo', 'bar', defaultFilter),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('should call HttpService.get with correct URL, headers and params and return data', async () => {
    // arrange
    const axiosResponse = { data: fakePulls } as AxiosResponse<PullRequestDto[]>;
    jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

    // act
    const result = await service.getPulls(
      'Bearer token123',
      'foo',
      'bar',
      defaultFilter,
    );

    // assert
    expect(httpService.get).toHaveBeenCalledWith(
      '/api/v1/repos/foo/bar/pulls',
      {
        headers: { Authorization: 'Bearer token123' },
        params: { state: defaultFilter.state, direction: defaultFilter.direction },
      },
    );
    expect(result).toEqual(fakePulls);
  });

  it('should propagate custom filter params to HttpService.get', async () => {
    const customFilter: PullRequestFilterDto = {
      state: State.OPEN,
      direction: Direction.ASC,
    };
    const axiosResponse = { data: fakePulls } as AxiosResponse<PullRequestDto[]>;
    jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

    const result = await service.getPulls(
      'Bearer tok',
      'foo',
      'bar',
      customFilter,
    );

    expect(httpService.get).toHaveBeenCalledWith(
      '/api/v1/repos/foo/bar/pulls',
      {
        headers: { Authorization: 'Bearer tok' },
        params: { state: 'open', direction: 'asc' },
      },
    );
    expect(result).toEqual(fakePulls);
  });

  it('should throw 502 BadGateway if downstream call errors', async () => {
    jest
      .spyOn(httpService, 'get')
      .mockReturnValue(throwError(() => new Error('network error')));

    await expect(
      service.getPulls('Bearer tok', 'foo', 'bar', defaultFilter),
    ).rejects.toMatchObject({ status: 502 });
  });
});