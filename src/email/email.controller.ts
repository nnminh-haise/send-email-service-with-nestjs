import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { EmailService } from './email.service';
import { RequestedUser } from 'src/decorator/request-user.decorator';
import { CreateEmailDto } from './dto/create-email.dto';

dotenv.config();

const resourcePath: string = `${process.env.API_PREFIX}/${process.env.API_VERSION}/emails`;

@Controller(resourcePath)
@UseGuards(JwtGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('send')
  async sendPublicEmail(
    @RequestedUser() user: any,
    @Body() createEmailDto: CreateEmailDto,
  ) {
    return await this.emailService.createAndSendEmail(user.id, createEmailDto);
  }
}
