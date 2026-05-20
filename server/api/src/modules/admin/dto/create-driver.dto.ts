import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsString()
  @Matches(/^\+?[0-9 ]{6,20}$/, { message: 'Invalid phone format' })
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(80)
  password: string;

  @IsOptional()
  @IsIn(['scooter', 'bike', 'car'])
  vehicle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  license_plate?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
