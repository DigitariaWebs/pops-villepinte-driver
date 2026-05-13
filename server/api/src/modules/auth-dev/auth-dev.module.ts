import { Module } from '@nestjs/common';
import { AuthDevController } from './auth-dev.controller';
import { AuthDevService } from './auth-dev.service';

@Module({
  controllers: [AuthDevController],
  providers: [AuthDevService],
})
export class AuthDevModule {}
