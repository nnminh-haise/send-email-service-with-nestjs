import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private logger: Logger = new Logger(DatabaseService.name);

  async onModuleInit() {
    mongoose.connection.on('connected', () => {
      this.logger.log('Connected to database');
    });

    mongoose.connection.on('disconnected', () => {
      this.logger.error('Disconnected from database');
    });

    mongoose.connection.on('error', (error) => {
      this.logger.error('Database error', error);
    });
  }
}
