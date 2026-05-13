import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { AuthDevService } from './auth-dev.service';
import { DevSignInDto } from './dto/dev-signin.dto';

@Controller('auth')
export class AuthDevController {
  constructor(private readonly service: AuthDevService) {}

  @Public()
  @Post('dev-signin')
  signIn(@Body() dto: DevSignInDto) {
    return this.service.signIn(dto.phone, dto.code);
  }
}
