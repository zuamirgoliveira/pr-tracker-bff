import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { RepositoryModule } from './repository/repository.module';
import { PullRequestModule } from './pullrequest/pull-request.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    RepositoryModule,
    PullRequestModule,
  ],
})
export class AppModule {}
