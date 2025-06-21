import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryController } from './repository.controller';
import { RepositoryService } from './repository.service';
import { RepoDto } from './dto/repo.dto';
import { RepoFilterDto } from './dto/repo-filter.dto';
import { RepoType, SortField, Direction } from './dto/repo-filter.dto';
import { HttpException } from '@nestjs/common';

describe('RepositoryController', () => {
  let controller: RepositoryController;
  let service: RepositoryService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepositoryController],
      providers: [
        {
          provide: RepositoryService,
          useValue: { getUserRepos: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<RepositoryController>(RepositoryController);
    service = module.get<RepositoryService>(RepositoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserRepos', () => {
    it('should return an array of RepoDto using default filter', async () => {
      jest.spyOn(service, 'getUserRepos').mockResolvedValue(fakeRepos);

      const defaultFilter = new RepoFilterDto();
      const result = await controller.getUserRepos('Bearer faketoken', defaultFilter);

      expect(service.getUserRepos).toHaveBeenCalledWith('Bearer faketoken', defaultFilter);
      expect(result).toEqual(fakeRepos);
    });

    it('should return an array of RepoDto using custom filter', async () => {
      jest.spyOn(service, 'getUserRepos').mockResolvedValue(fakeRepos);

      const customFilter: RepoFilterDto = {
        type: 'owner' as RepoType,
        sort: SortField.UPDATED,
        direction: Direction.ASC,
        perPage: 10,
        page: 2,
      };

      const result = await controller.getUserRepos('Bearer faketoken', customFilter);

      expect(service.getUserRepos).toHaveBeenCalledWith('Bearer faketoken', customFilter);
      expect(result).toEqual(fakeRepos);
    });

    it('should throw 400 BadRequest if Authorization header is missing', async () => {
      const err = new HttpException('Authorization header não informado', 400);
      jest.spyOn(service, 'getUserRepos').mockRejectedValue(err);

      await expect(
        controller.getUserRepos('', new RepoFilterDto()),
      ).rejects.toMatchObject({ status: 400 });
    });

    it('should throw 502 BadGateway if service fails downstream', async () => {
      const err = new HttpException('Erro ao buscar repositórios no backend', 502);
      jest.spyOn(service, 'getUserRepos').mockRejectedValue(err);

      await expect(
        controller.getUserRepos('Bearer faketoken', new RepoFilterDto()),
      ).rejects.toMatchObject({ status: 502 });
    });
  });
});