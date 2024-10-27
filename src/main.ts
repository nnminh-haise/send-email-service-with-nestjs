import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ApiResponseTransformInterceptor } from './interceptor/api-response-transform.interceptor';
import * as dotenv from 'dotenv';

dotenv.config();

const applicationPort: string = process.env.APP_PORT;

async function bootstrap() {
  const app: INestApplication<any> = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ApiResponseTransformInterceptor());

  await app.listen(applicationPort);
}
bootstrap();
