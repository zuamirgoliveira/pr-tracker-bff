import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule }   from '@nestjs/axios';
import { AuthService }  from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
