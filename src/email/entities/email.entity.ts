import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import e from 'express';
import { Receiver } from 'src/receiver/entities/receiver.entity';
import { User } from 'src/user/entities/user.entity';

@Schema({ timestamps: true })
export class Email {
  id: string;

  @Prop({ ref: Receiver.name, type: String, required: true })
  receiver: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  body: string;

  @Prop({ default: 'This email is sent automatically by the system' })
  header: string;

  @Prop({ default: "If you don't know the sender, please ignore this email" })
  footer: string;

  @Prop({ ref: User.name, type: String, required: true })
  sender: string;
}

export type EmailDocument = Email & Document;

export type PopulatedEmail = Email & {
  receiver: Receiver;
  sender: User;
};

const EmailSchema = SchemaFactory.createForClass(Email);

EmailSchema.index({ receiver: 1, sender: 1, createdAt: 1 }, { unique: true });

export { EmailSchema };
