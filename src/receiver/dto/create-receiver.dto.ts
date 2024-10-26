import { IsEmail, IsString, Length } from 'class-validator';

export class CreateReceiverDto {
  @IsString({ message: 'First name must be a string' })
  @Length(1, 50, {
    message: 'First name must be between 1 and 50 characters',
  })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @Length(1, 100, {
    message: 'Last name must be between 1 and 100 characters',
  })
  lastName: string;

  @IsEmail()
  email: string;
}
