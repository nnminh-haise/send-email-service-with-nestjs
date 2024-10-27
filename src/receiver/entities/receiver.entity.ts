import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/user/entities/user.entity';
import { ReceiverType } from './receiver-type.enum';

@Schema({ timestamps: true })
export class Receiver {
  id: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: ReceiverType.ANONYMOUS })
  receiverType: ReceiverType;

  @Prop({
    ref: User.name,
    type: String,
    required: true,
  })
  creator: string;
}

export type ReceiverDocument = Receiver & Document;

export type PopulatedReceiver = Receiver & { creator: User };

const ReceiverSchema = SchemaFactory.createForClass(Receiver);

ReceiverSchema.index({ email: 1, firstName: 1, lastName: 1 }, { unique: true });
ReceiverSchema.index(
  {
    creator: 1,
    email: 1,
  },
  { unique: true },
);

export { ReceiverSchema };
