import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { EmailService } from './email.service';
import { RequestedUser } from 'src/decorator/request-user.decorator';
import { CreateEmailDto } from './dto/create-email.dto';
import { Throttle } from '@nestjs/throttler';

const resourcePath: string = `${process.env.API_PREFIX}/${process.env.API_VERSION}/emails`;

@Controller(resourcePath)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('notify')
  @Throttle({ default: { limit: 2, ttl: 60 } })
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
