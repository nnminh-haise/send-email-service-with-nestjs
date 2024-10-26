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
import { Role } from 'src/auth/entities/role.enum';
import { transformMongooseDocument } from 'src/mongoose/mongoose.service';

dotenv.config();

const bcryptSaltRounds: number = parseInt(process.env.BCRYPT_SALT_ROUNDS);

@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, bcryptSaltRounds);
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword: string = await this.hashPassword(
        createUserDto.password,
      );
      const userDetailDocument = new this.UserModel({
        ...createUserDto,
        password: hashedPassword,
        roles: [Role.USER],
      });
      const savedUser = await userDetailDocument.save();
      const response = savedUser.toJSON() as User;
      delete response.password;
      return response;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException('Email already exists');
      }

      this.logger.fatal(error);
      throw new InternalServerErrorException('Failed to create user', error);
    }
  }

  async findOne(id: string) {
    const userDocument = await this.UserModel.findById(id)
      .select({ password: 0 })
      .transform(transformMongooseDocument)
      .exec();
    return userDocument as User;
  }

  async findUserDetailByEmail(email: string) {
    const userDetailDocument = await this.UserModel.findOne({ email })
      .transform(transformMongooseDocument)
      .exec();
    return userDetailDocument as User;
  }

  async findUserDetailById(id: string) {
    const userDocument = await this.UserModel.findById(id)
      .transform(transformMongooseDocument)
      .exec();
    return userDocument as User;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.UserModel.findByIdAndUpdate(
        id,
        { ...updateUserDto },
        { new: true },
      ).exec();
      if (!updatedUser) throw new NotFoundException('User not found');
      return await this.findOne(id);
    } catch (error: any) {
      this.logger.fatal(error);
      throw new InternalServerErrorException('Faield to update user', error);
    }
  }

  async updatePassword(id: string, newPassword: string) {
    try {
      const hashedPassword = await this.hashPassword(newPassword);
      const updatedUser = await this.UserModel.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true },
      ).exec();
      if (!updatedUser) throw new NotFoundException('User not found');
      return await this.findOne(id);
    } catch (error: any) {
      this.logger.fatal(error);
      throw new InternalServerErrorException(
        'Failed to update password',
        error,
      );
    }
  }
}
