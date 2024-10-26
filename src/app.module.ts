import * as dotenv from 'dotenv';
import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseService } from './database/database.service';
import { ReceiverModule } from './receiver/receiver.module';
import mongoose from 'mongoose';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DATABASE_CONNECTION_STRING),
    EmailModule,
    UserModule,
    AuthModule,
    ReceiverModule,
  ],
  controllers: [],
  providers: [DatabaseService],
})
export class AppModule {
  constructor() {
    if (process.env.DATABASE_DEBUG_MODE === 'true') {
      mongoose.set('debug', true);
    }
  }
}
