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
import { Role } from 'src/auth/entities/role.enum';
import { transformMongooseDocument } from 'src/mongoose/mongoose.service';
import { UserType } from './entities/user-type.enum';
const bcrypt = require('bcryptjs');

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
      const hashedPassword: string = await this.hashPassword(
        createUserDto.password,
      );
      const userDocument = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
        roles: [Role.USER],
        userType: UserType.REGISTERED,
      });
      const savedUser = await userDocument.save();
      return await this.findOne(savedUser._id.toString());
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException('Email already exists');
      }

      this.logger.fatal(error);
      throw new InternalServerErrorException('Failed to create user', error);
    }
  }

  async createAnonymousUser() {
    const timestamp = new Date().getTime();
    const firstName = `Anonymous`;
    const lastName = `User-${timestamp}`;
    const email = `${timestamp}@example.com`;
    const password = await this.hashPassword(`${timestamp}`);
    const phone = `${timestamp}`;
    try {
      const userDocument = new this.userModel({
        firstName,
        lastName,
        email,
        password,
        phone,
        roles: [Role.USER],
        userType: UserType.ANONYMOUS,
      });
      const savedUser = await userDocument.save();
      return await this.findOne(savedUser._id.toString());
    } catch (error: any) {
      this.logger.fatal(error);
      throw new InternalServerErrorException(
        'Failed to create anonymous user',
        error,
      );
    }
  }

  async findOne(id: string) {
    const userDocument = await this.userModel
      .findById(id)
      .select({ password: 0, __v: 0 })
      .transform(transformMongooseDocument)
      .exec();
    return userDocument as User;
  }

  async findOneByEmail(email: string) {
    const userDocument = await this.userModel
      .findOne({ email })
      .select({ password: 0, __v: 0 })
      .transform(transformMongooseDocument)
      .exec();
    return userDocument as User;
  }

  async findUserDetailByEmail(email: string) {
    const userDetailDocument = await this.userModel
      .findOne({ email })
      .select({ __v: 0 })
      .transform(transformMongooseDocument)
      .exec();
    return userDetailDocument as User;
  }

  async findUserDetailById(id: string) {
    const userDocument = await this.userModel
      .findById(id)
      .select({ __v: 0 })
      .transform(transformMongooseDocument)
      .exec();
    return userDocument as User;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, { ...updateUserDto }, { new: true })
        .exec();
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
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, { password: hashedPassword }, { new: true })
        .exec();
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
