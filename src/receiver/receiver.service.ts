import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateReceiverDto } from './dto/create-receiver.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { PopulatedReceiver, Receiver } from './entities/receiver.entity';
import { transformMongooseDocument } from 'src/mongoose/mongoose.service';
import { map } from 'rxjs';
import { ReceiverType } from './entities/receiver-type.enum';

@Injectable()
export class ReceiverService {
  private logger: Logger = new Logger(ReceiverService.name);

  constructor(
    @InjectModel(Receiver.name)
    private readonly receiverModel: Model<Receiver>,
    private readonly userService: UserService,
  ) {}

  async create(requestedUserId: string, createReceiverDto: CreateReceiverDto) {
    const creator: User = await this.userService.findOne(requestedUserId);
    if (!creator) throw new NotFoundException('User not found');

    try {
      const receiverModel = new this.receiverModel({
        ...createReceiverDto,
        receiverType: ReceiverType.REGISTERED,
        creator: creator.id,
      });
      const receiverDocument = await receiverModel.save();
      return await this.findOne(receiverDocument._id.toString());
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException('Receiver already exists');
      }

      this.logger.fatal(error);
      throw new InternalServerErrorException(
        'Failed to create receiver',
        error,
      );
    }
  }

  async createAnonymousReceiver(receiverEmail: string) {
    try {
      const existingReceiver: PopulatedReceiver =
        await this.findByEmail(receiverEmail);
      if (existingReceiver) return existingReceiver;

      const anonymousSender: User =
        await this.userService.createAnonymousUser();
      if (!anonymousSender) {
        this.logger.fatal('Cannot create anonymous user');
        throw new InternalServerErrorException('Cannot create anonymous user');
      }

      const timestamp: number = new Date().getTime();
      const receiverModel = new this.receiverModel({
        firstName: 'Anonymous',
        lastName: `User ${timestamp}`,
        email: receiverEmail,
        receiverType: ReceiverType.ANONYMOUS,
        creator: anonymousSender.id,
      });
      const receiverDocument = await receiverModel.save();
      return await this.findOne(receiverDocument._id.toString());
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException('Receiver already exists');
      }

      this.logger.fatal(error);
      throw new InternalServerErrorException(
        'Failed to create receiver',
        error,
      );
    }
  }

  async findOne(id: string) {
    const receiverDocument = await this.receiverModel
      .findOne({ _id: id })
      .select({ __v: 0 })
      .populate({
        path: 'creator',
        select: '-password -__v',
        transform: transformMongooseDocument,
      })
      .transform(transformMongooseDocument)
      .exec();
    return receiverDocument as PopulatedReceiver;
  }

  async findByEmail(email: string) {
    const receiverDocument = await this.receiverModel
      .findOne({ email })
      .select({ __v: 0 })
      .populate({
        path: 'creator',
        select: '-password -__v',
        transform: transformMongooseDocument,
      })
      .transform(transformMongooseDocument)
      .exec();
    return receiverDocument as PopulatedReceiver;
  }

  async findByCreatorId(creatorId: string) {
    const receiverDocuments = await this.receiverModel
      .find({ creator: { id: creatorId } })
      .select({ __v: 0 })
      .populate({
        path: 'creator',
        select: '-password -__v',
        transform: transformMongooseDocument,
      })
      .transform((doc: any) => doc.map(transformMongooseDocument))
      .exec();
    return receiverDocuments as PopulatedReceiver[];
  }
}
