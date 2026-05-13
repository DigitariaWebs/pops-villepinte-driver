import { IsString, Length, Matches } from 'class-validator';

export class DevSignInDto {
  @IsString()
  @Matches(/^\+?\d{6,15}$/, { message: 'Invalid phone format' })
  phone!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}
