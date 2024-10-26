import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ReceiverService } from './receiver.service';
import { CreateReceiverDto } from './dto/create-receiver.dto';
import * as dotenv from 'dotenv';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { RequestedUser } from 'src/decorator/request-user.decorator';
import { Roles } from 'src/decorator/role.decorator';
import { Role } from 'src/auth/entities/role.enum';
import { RoleGuard } from 'src/auth/guard/role.guard';

dotenv.config();

const resourcePath: string = `${process.env.API_PREFIX}/${process.env.API_VERSION}/receivers`;

@Controller(resourcePath)
@UseGuards(JwtGuard, RoleGuard)
export class ReceiverController {
  constructor(private readonly receiverService: ReceiverService) {}

  @Post()
  @Roles(Role.USER)
  async create(
    @RequestedUser() user: any,
    @Body() createReceiverDto: CreateReceiverDto,
  ) {
    return await this.receiverService.create(user.id, createReceiverDto);
  }

  @Get(':id')
  @Roles(Role.USER)
  async findOne(@Param('id') id: string) {
    return await this.receiverService.findOne(id);
  }
}
