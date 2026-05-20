import { IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterPushTokenDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  expo_push_token: string;
}
