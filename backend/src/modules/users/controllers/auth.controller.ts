import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';

import { Public } from '@shared/providers/auth/decorators/public.decorator';

import { AuthDto } from '../dtos/auth.dto';
import { AuthService, IAuthType } from '../services/auth.service';

@Public()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  async auth(@Body() input: AuthDto): Promise<IAuthType> {
    return this.authService.validadeUser(input);
  }
}
