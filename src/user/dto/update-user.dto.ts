import { IsDate, IsEnum, IsString, Length } from 'class-validator';
import { Gender } from '../entities/gender.enum';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @IsString({ message: 'First name must be a string' })
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @Length(2, 100, { message: 'Last name must be between 2 and 100 characters' })
  lastName: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString({ message: 'Phone must be a string' })
  phone: string;

  @IsDate({ message: 'Date of birth must be a date' })
  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date;

  @IsString({ message: 'Address must be a string' })
  address: string;
}
