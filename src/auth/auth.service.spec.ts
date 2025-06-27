// src/auth/auth.service.spec.ts
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('AuthService – unit tests', () => {
  let svc: AuthService;
  let http: HttpService;

  beforeEach(() => {
    const configMock = {
      get: (key: string) => ({
        GITHUB_CLIENT_ID:     'id123',
        GITHUB_CLIENT_SECRET: 'sec456',
        BFF_URL:              'http://bff',
      }[key]),
    } as ConfigService;

    http = { post: jest.fn() } as any as HttpService;
    svc = new AuthService(configMock, http);
  });

  it('should construct without errors when all env vars are set', () => {
    expect(svc).toBeDefined();
  });

  it('getGithubAuthUrl includes client_id, redirect_uri and scope', () => {
    const url = svc.getGithubAuthUrl();
    expect(url).toContain('client_id=id123');
    expect(url).toContain('redirect_uri=http%3A%2F%2Fbff%2Fauth%2Fgithub%2Fcallback');
    expect(url).toContain('scope=repo+user');
    expect(url.startsWith('https://github.com/login/oauth/authorize?')).toBe(true);
  });

  it('exchangeCodeForToken returns the access_token from GitHub', async () => {
    const fake = { access_token: 'tok-xyz' };
    const axiosResponse: AxiosResponse<{ access_token: string }> = {
      data: fake,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as any;

    jest.spyOn(http, 'post').mockReturnValue(of(axiosResponse));

    const token = await svc.exchangeCodeForToken('the-code');
    expect(token).toBe('tok-xyz');
    expect(http.post).toHaveBeenCalledWith(
      'https://github.com/login/oauth/access_token',
      { client_id: 'id123', client_secret: 'sec456', code: 'the-code' },
      { headers: { Accept: 'application/json' } },
    );
  });

  it('exchangeCodeForToken propagates errors when HTTP call fails', async () => {
    jest.spyOn(http, 'post').mockReturnValue(throwError(() => new Error('network failure')));
    await expect(svc.exchangeCodeForToken('any')).rejects.toThrow('network failure');
  });
});

describe('AuthService – missing environment variables', () => {
  const httpMock = {} as HttpService;

  it('throws if GITHUB_CLIENT_ID is not set', () => {
    const cfg = { get: (key: string) => key === 'GITHUB_CLIENT_SECRET' ? 'sec' :
                                      key === 'BFF_URL'              ? 'http://bff' : undefined } as any;
    expect(() => new AuthService(cfg, httpMock))
      .toThrow('GITHUB_CLIENT_ID is not set');
  });

  it('throws if GITHUB_CLIENT_SECRET is not set', () => {
    const cfg = { get: (key: string) => key === 'GITHUB_CLIENT_ID' ? 'id' :
                                      key === 'BFF_URL'          ? 'http://bff' : undefined } as any;
    expect(() => new AuthService(cfg, httpMock))
      .toThrow('GITHUB_CLIENT_SECRET is not set');
  });

  it('throws if BFF_URL is not set', () => {
    const cfg = { get: (key: string) => key === 'GITHUB_CLIENT_ID'     ? 'id' :
                                      key === 'GITHUB_CLIENT_SECRET' ? 'sec' : undefined } as any;
    expect(() => new AuthService(cfg, httpMock))
      .toThrow('BFF_URL is not set');
  });
});