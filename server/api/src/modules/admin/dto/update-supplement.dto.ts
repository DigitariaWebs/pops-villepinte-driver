import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateSupplementDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price_eur?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
