import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Gender } from './gender.enum';
import { Role } from 'src/auth/entities/role.enum';
import { OmitType } from '@nestjs/mapped-types';
import { UserType } from './user-type.enum';

@Schema({ timestamps: true })
export class User {
  id: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], enum: Role, default: [Role.USER] })
  roles: Role[];

  @Prop({ default: Gender.MALE })
  gender: Gender;

  @Prop({ required: true })
  phone: string;

  @Prop({ default: UserType.ANONYMOUS })
  userType: UserType;

  @Prop({ default: null })
  dateOfBirth: Date;

  @Prop({ default: null })
  address: string;
}

export type UserDetailDocument = User & Document;

const UserSchema = SchemaFactory.createForClass(User);

export { UserSchema };
