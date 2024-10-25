import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [EmailModule, UserModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
