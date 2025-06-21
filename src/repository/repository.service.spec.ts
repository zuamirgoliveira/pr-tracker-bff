import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryService } from './repository.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { RepoDto } from './dto/repo.dto';
import { RepoFilterDto, RepoType, SortField, Direction } from './dto/repo-filter.dto';
import { HttpException } from '@nestjs/common';

describe('RepositoryService', () => {
  let service: RepositoryService;
  let httpService: HttpService;

  const fakeRepos: RepoDto[] = [
    {
      id: 1,
      name: 'repo-one',
      fullName: 'testuser/repo-one',
      htmlUrl: 'https://github.com/testuser/repo-one',
      description: 'First test repo',
      fork: false,
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-02T00:00:00Z'),
    },
    {
      id: 2,
      name: 'repo-two',
      fullName: 'testuser/repo-two',
      htmlUrl: 'https://github.com/testuser/repo-two',
      description: null,
      fork: true,
      createdAt: new Date('2025-02-01T00:00:00Z'),
      updatedAt: new Date('2025-02-02T00:00:00Z'),
    },
  ];

  const defaultFilter = new RepoFilterDto(); // defaults: all, created, desc, 30, 1

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepositoryService,
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<RepositoryService>(RepositoryService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw 400 BadRequest if authHeader is missing', async () => {
    await expect(service.getUserRepos('', defaultFilter))
      .rejects.toMatchObject({ status: 400 });
  });

  it('should call HttpService.get with correct URL, headers and params and return data', async () => {
    // arrange
    jest.spyOn(httpService, 'get').mockReturnValue(of({ data: fakeRepos } as any));

    // act
    const result = await service.getUserRepos('Bearer token123', defaultFilter);

    // assert
    expect(httpService.get).toHaveBeenCalledWith(
      '/api/v1/user/repos',
      {
        headers: { Authorization: 'Bearer token123' },
        params: {
          type: defaultFilter.type,
          sort: defaultFilter.sort,
          direction: defaultFilter.direction,
          perPage: defaultFilter.perPage,
          page: defaultFilter.page,
        },
      },
    );
    expect(result).toEqual(fakeRepos);
  });

  it('should propagate custom filter params to HttpService.get', async () => {
    const customFilter: RepoFilterDto = {
      type: RepoType.OWNER,
      sort: SortField.UPDATED,
      direction: Direction.ASC,
      perPage: 10,
      page: 2,
    };
    jest.spyOn(httpService, 'get').mockReturnValue(of({ data: fakeRepos } as any));

    const result = await service.getUserRepos('Bearer tok', customFilter);

    expect(httpService.get).toHaveBeenCalledWith(
      '/api/v1/user/repos',
      {
        headers: { Authorization: 'Bearer tok' },
        params: {
          type: 'owner',
          sort: 'updated',
          direction: 'asc',
          perPage: 10,
          page: 2,
        },
      },
    );
    expect(result).toEqual(fakeRepos);
  });

  it('should throw 502 BadGateway if downstream call errors', async () => {
    jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => new Error('network fail')));

    await expect(service.getUserRepos('Bearer tok', defaultFilter))
      .rejects.toMatchObject({ status: 502 });
  });
});