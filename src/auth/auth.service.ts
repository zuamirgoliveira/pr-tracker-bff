import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService }   from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(
    private cfg: ConfigService,
    private http: HttpService,
  ) {
    this.clientId     = this.cfg.get<string>('GITHUB_CLIENT_ID') ?? (() => { throw new Error('GITHUB_CLIENT_ID is not set'); })();
    this.clientSecret = this.cfg.get<string>('GITHUB_CLIENT_SECRET') ?? (() => { throw new Error('GITHUB_CLIENT_SECRET is not set'); })();
    const bffUrl      = this.cfg.get<string>('BFF_URL') ?? (() => { throw new Error('BFF_URL is not set'); })();
    this.redirectUri  = `${bffUrl}/auth/github/callback`;
  }

  getGithubAuthUrl(): string {
    const params = new URLSearchParams({
      client_id:     this.clientId,
      redirect_uri:  this.redirectUri,
      scope:         'repo user',
    });
    return `https://github.com/login/oauth/authorize?${params}`;
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const url = 'https://github.com/login/oauth/access_token';
    const resp$ = this.http.post(
      url,
      { client_id: this.clientId, client_secret: this.clientSecret, code },
      { headers: { Accept: 'application/json' } },
    );
    const { data } = await lastValueFrom(resp$);
    return data.access_token;
  }
}