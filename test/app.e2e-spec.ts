import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { RepoDto } from '../src/repository/dto/repo.dto';

describe('E2E: User & Repos Controllers', () => {
  let app: INestApplication;

  const fakeUser = {
    login: 'testuser',
    name: 'Test User',
    avatarUrl: 'http://example.com/avatar.png',
    email: 'testuser@example.com',
  };

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

  const fakeReposResponse = fakeRepos.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue({
        get: jest.fn().mockImplementation((url: string, options: any) => {
          if (url === '/api/v1/user') {
            return of({ data: fakeUser });
          }
          if (url === '/api/v1/user/repos') {
            return of({ data: fakeRepos });
          }
          // fallback if needed
          return of({ data: null });
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /user → 200 e payload do usuário', () => {
    return request(app.getHttpServer())
      .get('/user')
      .set('Authorization', 'Bearer faketoken')
      .expect(HttpStatus.OK)
      .expect(fakeUser);
  });

  it('GET /user sem Authorization → 400', () => {
    return request(app.getHttpServer())
      .get('/user')
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('GET /user/repos → 200 e lista de repositórios', () => {
    return request(app.getHttpServer())
      .get('/user/repos')
      .set('Authorization', 'Bearer faketoken')
      .expect(HttpStatus.OK)
      .expect(fakeReposResponse);
  });

  it('GET /user/repos sem Authorization → 400', () => {
    return request(app.getHttpServer())
      .get('/user/repos')
      .expect(HttpStatus.BAD_REQUEST);
  });

  afterAll(async () => {
    await app.close();
  });
});