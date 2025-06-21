import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import rateLimit from 'express-rate-limit';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        statusCode: 429,
        error: 'Too Many Requests',
        message:
          'Você excedeu o limite de requisições. Tente novamente mais tarde.',
      },
    }),
  );

  app.enableCors({
    origin: ['*'],
    methods: 'GET',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('PR Tracker BFF')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, doc);

  await app.listen(process.env.PORT || 3000);
}
void bootstrap();
