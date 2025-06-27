import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import * as request from 'supertest';
import { Server } from 'http';
import { AppModule } from './../src/app.module';
import { RepoDto } from '../src/repository/dto/repo.dto';
import { PullRequestDto } from '../src/pullrequest/dto/pull-request.dto';

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

  const fakeReposResponse = fakeRepos.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  const fakePulls: PullRequestDto[] = [
    {
      title: 'Add new feature',
      htmlUrl: 'https://github.com/testuser/repo-one/pull/1',
      state: 'open',
      createdAt: new Date('2025-03-01T10:00:00Z'),
      user: { login: 'contrib1', avatarUrl: 'http://example.com/avatar1.png' },
    },
    {
      title: 'Fix bug',
      htmlUrl: 'https://github.com/testuser/repo-one/pull/2',
      state: 'closed',
      createdAt: new Date('2025-03-02T11:30:00Z'),
      user: { login: 'contrib2', avatarUrl: 'http://example.com/avatar2.png' },
    },
  ];

  const fakePullsResponse = fakePulls.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue({
        get: jest.fn().mockImplementation((url: string) => {
          if (url === '/api/v1/user') {
            return of({ data: fakeUser });
          }
          if (url === '/api/v1/user/repos') {
            return of({ data: fakeRepos });
          }
          if (url.startsWith('/api/v1/repos/') && url.endsWith('/pulls')) {
            return of({ data: fakePullsResponse });
          }
          return of({ data: null });
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /user with Authorization header → 200 + user payload', () => {
    return request(app.getHttpServer() as unknown as Server)
      .get('/user')
      .set('Authorization', 'Bearer faketoken')
      .expect(HttpStatus.OK)
      .expect(fakeUser);
  });

  it('GET /user with GH_TOKEN cookie → 200 + user payload', () => {
    return request(app.getHttpServer() as unknown as Server)
      .get('/user')
      .set('Cookie', 'GH_TOKEN=faketoken')
      .expect(HttpStatus.OK)
      .expect(fakeUser);
  });

  it('GET /user without header or cookie → 400 Bad Request', () => {
    return request(app.getHttpServer() as unknown as Server)
      .get('/user')
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('GET /user/repos → 200 e lista de repositórios', () => {
    return request(app.getHttpServer() as unknown as Server)
      .get('/user/repos')
      .set('Authorization', 'Bearer faketoken')
      .expect(HttpStatus.OK)
      .expect(fakeReposResponse);
  });

  it('GET /user/repos sem Authorization → 400', () => {
    return request(app.getHttpServer() as unknown as Server)
      .get('/user/repos')
      .expect(HttpStatus.BAD_REQUEST);
  });

   it('GET /repos/:owner/:repo/pulls → 200 e lista de pull requests', () => {
    return request(app.getHttpServer() as unknown as Server)
      .get('/repos/testuser/repo-one/pulls')
      .set('Authorization', 'Bearer faketoken')
      .expect(HttpStatus.OK)
      .expect(fakePullsResponse);
  });

  it('GET /repos/:owner/:repo/pulls sem Authorization → 400', () => {
    return request(app.getHttpServer() as unknown as Server)
      .get('/repos/testuser/repo-one/pulls')
      .expect(HttpStatus.BAD_REQUEST);
  });



  afterAll(async () => {
    await app.close();
  });
});

describe('E2E: Auth Controller', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(HttpService)
    .useValue({
      post: jest.fn().mockReturnValue(of({ data: { access_token: 'xyz' } })),
    })
    .compile();

    app = mod.createNestApplication();
    await app.init();
  });

  it('GET /auth/github redireciona (302)', () => {
    return request(app.getHttpServer())
      .get('/auth/github')
      .expect(HttpStatus.FOUND);
  });

  it('GET /auth/github/callback?code=abc seta cookie e redireciona', () => {
    return request(app.getHttpServer())
      .get('/auth/github/callback')
      .query({ code: 'abc' })
      .expect('Set-Cookie', /GH_TOKEN=xyz/)
      .expect(HttpStatus.FOUND);
  });
  
  afterAll(() => app.close());
});