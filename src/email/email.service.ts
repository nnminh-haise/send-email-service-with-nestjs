import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Email } from './entities/email.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreateEmailDto } from './dto/create-email.dto';

@Injectable()
export class EmailService {
  constructor(
    @InjectModel(Email.name)
    private readonly emailModel: Model<Email>,
  ) {}

  async create(createEmailDto: CreateEmailDto): Promise<Email> {
    const createdEmail = new this.emailModel(createEmailDto);
    return createdEmail.save();
  }
}
