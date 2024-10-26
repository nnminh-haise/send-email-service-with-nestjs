import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Receiver } from 'src/receiver/entities/receiver.entity';

export class CreateEmailDto {
  @IsNotEmpty({ message: 'Receiver is required' })
  @IsMongoId({ message: 'Receiver ID must be a valid MongoDB ID' })
  recevierId: string;

  @IsString({ message: 'Subject must be a string' })
  @IsNotEmpty({ message: 'Subject is required' })
  subject: string;

  @IsString({ message: 'Body must be a string' })
  @IsNotEmpty({ message: 'Body is required' })
  body: string;

  @IsOptional()
  @IsString({ message: 'Header must be a string' })
  header?: string;

  @IsOptional()
  @IsString({ message: 'Footer must be a string' })
  footer?: string;
}
