import * as dotenv from 'dotenv';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestedUser } from 'src/decorator/request-user.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { Roles } from 'src/decorator/role.decorator';
import { Role } from 'src/auth/entities/role.enum';

dotenv.config();

const resourcePath: string = `${process.env.API_PREFIX}/${process.env.API_VERSION}/users`;

@Controller(resourcePath)
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('my')
  @UseGuards(RoleGuard)
  @Roles(Role.USER, Role.ADMIN)
  async findProfile(@RequestedUser() user: any) {
    return await this.userService.findOne(user.id);
  }

  @Patch()
  async update(
    @RequestedUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(user.id, updateUserDto);
  }
}
