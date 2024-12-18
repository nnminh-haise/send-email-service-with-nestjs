import * as dotenv from 'dotenv';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { RequestedUser } from 'src/decorator/request-user.decorator';
import { AuthorizedResponse } from './dto/authorized-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LocalGuard } from './guard/local.guard';
import { JwtGuard } from './guard/jwt.guard';

dotenv.config();

const resourcePath: string = `${process.env.API_PREFIX}/${process.env.API_VERSION}/auth`;

@Controller(resourcePath)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(LocalGuard)
  async authenticate(@RequestedUser() user: any): Promise<AuthorizedResponse> {
    return await this.authService.authenticate(user);
  }

  @Post('sign-up')
  @HttpCode(201)
  async registrate(
    @Body() createUserDto: CreateUserDto,
  ): Promise<AuthorizedResponse> {
    return await this.authService.registrate(createUserDto);
  }

  @Patch('change-password')
  @UseGuards(JwtGuard)
  async changePassword(
    @RequestedUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(user.id, changePasswordDto);
  }
}
