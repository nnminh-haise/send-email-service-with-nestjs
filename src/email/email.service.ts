import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/user/entities/user.entity';
import { CreateEmailDto } from './dto/create-email.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Email, PopulatedEmail } from './entities/email.entity';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { NotFoundError } from 'rxjs';
import { Receiver } from 'src/receiver/entities/receiver.entity';
import { transformMongooseDocument } from 'src/mongoose/mongoose.service';
import { send } from 'process';
import { error } from 'console';

@Injectable()
export class EmailService {
  private logger: Logger = new Logger(EmailService.name);

  constructor(
    @InjectModel(Email.name)
    private readonly emailModel: Model<Email>,
    private readonly mailerService: MailerService,
    private readonly userService: UserService,
  ) {}

  async sendPublicEmail(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './confirmation',
      context: {
        name: 'test-name',
        ...user,
      },
    });
  }

  async createEmail(senderId: string, createEmailDto: CreateEmailDto) {
    const sender: User = await this.userService.findOne(senderId);
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    try {
      const emailDocument = new this.emailModel({
        ...createEmailDto,
        sender: sender.id,
        receiver: createEmailDto.recevierId,
      });
      const createdEmail = await emailDocument.save();
      return await this.findOne(createdEmail._id.toString());
    } catch (error: any) {
      this.logger.fatal(error.message);
      throw new InternalServerErrorException('Failed to create email', error);
    }
  }

  async findOne(id: string) {
    const emailDocument = await this.emailModel
      .findById(id)
      .select({ __v: 0 })
      .populate({
        path: 'sender',
        select: '-password -__v',
        transform: transformMongooseDocument,
      })
      .populate({
        path: 'receiver',
        select: '-password -__v',
        transform: transformMongooseDocument,
      })
      .transform(transformMongooseDocument)
      .exec();
    return emailDocument as PopulatedEmail;
  }

  async sendEmail(email: PopulatedEmail) {
    if (!email) {
      throw new NotFoundException('Email not found');
    }

    try {
      await this.mailerService.sendMail({
        to: email.receiver.email,
        subject: email.subject,
        from: email.sender.email,
        template: './general',
        context: {
          body: email.body.toString(),
          header: email.header?.toString(),
          footer: email.footer?.toString(),
        },
      });
      return email;
    } catch (error: any) {
      this.logger.fatal(error.message);
      throw new InternalServerErrorException('Failed to send email', error);
    }
  }

  async createAndSendEmail(senderId: string, createEmailDto: CreateEmailDto) {
    const email: PopulatedEmail = await this.createEmail(
      senderId,
      createEmailDto,
    );
    if (!email) {
      throw new NotFoundException('Email not found');
    }

    try {
      const sentEmailResponse = await this.sendEmail(email);
      if (!sentEmailResponse) {
        throw new InternalServerErrorException('Failed to send email');
      }
    } catch (error: any) {
      await this.emailModel.findByIdAndDelete(email.id);

      this.logger.fatal(error.message);
      throw new InternalServerErrorException(
        'Failed to create and send email',
        error,
      );
    }
  }
}
