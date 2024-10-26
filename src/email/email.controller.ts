import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { EmailService } from './email.service';
import { RequestedUser } from 'src/decorator/request-user.decorator';
import { CreateEmailDto } from './dto/create-email.dto';

dotenv.config();

const resourcePath: string = `${process.env.API_PREFIX}/${process.env.API_VERSION}/emails`;

@Controller(resourcePath)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('notify')
  async sendNotificationEmail(
    @Query('to') to: string,
    @Query('subject') subject: string,
    @Query('content') content: string,
  ) {
    await this.emailService.sendPublicEmail({ to, subject, content });
  }

  @Get('send')
  @UseGuards(JwtGuard)
  async createAndSendEmail(
    @RequestedUser() user: any,
    @Body() createEmailDto: CreateEmailDto,
  ) {
    return await this.emailService.createAndSendEmail(user.id, createEmailDto);
  }
}
