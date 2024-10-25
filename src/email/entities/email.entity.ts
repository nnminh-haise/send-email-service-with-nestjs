import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Email {
  id: number;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  body: string;
}

export type EmailDocument = Email & Document;

export const EmailSchema = SchemaFactory.createForClass(Email);
EmailSchema.index({ from: 1, to: 1, createdAt: 1 }, { unique: true });
