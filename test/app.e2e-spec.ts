import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  const fakeUser = {
    login: 'testuser',
    name: 'Test User',
    avatarUrl: 'http://example.com/avatar.png',
    email: 'testuser@example.com',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue({
        get: jest.fn().mockReturnValue(of({ data: fakeUser })),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /user → 200 e payload do usuário', () => {
    return request(app.getHttpServer())
      .get('/user')
      .set('Authorization', 'Bearer faketoken')
      .expect(200)
      .expect(fakeUser);
  });

  it('GET /user sem Authorization → 400', () => {
    return request(app.getHttpServer())
      .get('/user')
      .expect(400);
  });

  afterAll(async () => {
    await app.close();
  });
});