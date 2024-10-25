import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

const applicationPort: string = process.env.APP_PORT;

async function bootstrap() {
  const app: INestApplication<any> = await NestFactory.create(AppModule);
  await app.listen(applicationPort);
}
bootstrap();
