import { Module } from '@nestjs/common';
import { PullRequestService } from './pull-request.service';
import { PullRequestController } from './pull-request.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
      ConfigModule,
      HttpModule.registerAsync({
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          baseURL: config.get<string>('BACKEND_URL'),
          timeout: 5_000,
        }),
        inject: [ConfigService],
      }),
    ],
  controllers: [PullRequestController],
  providers: [PullRequestService],
})
export class PullRequestModule {}
