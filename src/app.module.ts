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

const databaseConnectionString: string = `${process.env.DATABASE_TYPE}://${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`;

@Module({
  imports: [
    MongooseModule.forRoot(databaseConnectionString),
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
