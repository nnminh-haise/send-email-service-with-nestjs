import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseService } from './database/database.service';
import { ReceiverModule } from './receiver/receiver.module';
import mongoose from 'mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      process.env.MODE === 'prod'
        ? process.env.DATABASE_CONNECTION_STRING_PROD
        : process.env.DATABASE_CONNECTION_STRING_DEV,
    ),
    ThrottlerModule.forRoot([
      {
        ttl: +process.env.APP_RATE_LIMIT_TTL * 1000 || 1000,
        limit: +process.env.APP_RATE_LIMIT_MAX || 2,
      },
    ]),
    EmailModule,
    UserModule,
    AuthModule,
    ReceiverModule,
  ],
  controllers: [],
  providers: [
    DatabaseService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  constructor() {
    if (process.env.DATABASE_DEBUG_MODE === 'true') {
      mongoose.set('debug', true);
    }
  }
}
