import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

const bcryptSaltRounds: number = parseInt(process.env.BCRYPT_SALT_ROUNDS);

@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, bcryptSaltRounds);
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await this.hashPassword(createUserDto.password);
      const user = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });
      const savedUser = await user.save();
      return savedUser.toJSON() as User;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException('Email already exists');
      }

      this.logger.fatal(error);
      throw new InternalServerErrorException('Failed to create user', error);
    }
  }

  async findOne(id: string) {
    const userDocument = await this.userModel
      .findById(id)
      .select({
        password: 0,
      })
      .exec();
    return userDocument?.toJSON();
  }

  async findUserDetailByEmail(email: string) {
    const userDocument = await this.userModel.findOne({ email }).exec();
    return userDocument?.toJSON();
  }

  async findUserDetailById(id: string) {
    const userDocument = await this.userModel.findById(id).exec();
    return userDocument?.toJSON();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          id,
          {
            ...updateUserDto,
          },
          { new: true },
        )
        .exec();
      if (!updatedUser) throw new NotFoundException('User not found');
      const response = updatedUser.toJSON() as User;
      delete response.password;
      return response;
    } catch (error: any) {
      this.logger.fatal(error);
      throw new InternalServerErrorException('Faield to update user', error);
    }
  }

  async updatePassword(id: string, newPassword: string) {
    try {
      const hashedPassword = await this.hashPassword(newPassword);
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, { password: hashedPassword }, { new: true })
        .exec();
      if (!updatedUser) throw new NotFoundException('User not found');
      const response = updatedUser.toJSON() as User;
      delete response.password;
      return response;
    } catch (error: any) {
      this.logger.fatal(error);
      throw new InternalServerErrorException(
        'Failed to update password',
        error,
      );
    }
  }
}
