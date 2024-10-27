import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { Email, EmailSchema } from './entities/email.entity';
import { UserModule } from 'src/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Email.name,
        schema: EmailSchema,
        collection: 'emails',
      },
    ]),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAILING_HOST,
        port: process.env.MAILING_PORT,
        secure: false,
        auth: {
          user: process.env.MAILING_HOST_EMAIL,
          pass: process.env.MAILING_HOST_PASSWORD,
        },
      },
      defaults: { from: `"No Reply" ${process.env.MAILING_HOST_EMAIL}` },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
    UserModule,
  ],
  controllers: [EmailController],
  providers: [
    EmailService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class EmailModule {}
