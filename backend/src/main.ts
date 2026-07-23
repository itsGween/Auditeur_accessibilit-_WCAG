import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { buildSwaggerDocument } from './swagger.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:5173',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  SwaggerModule.setup('api/docs', app, buildSwaggerDocument(app));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

void bootstrap();
