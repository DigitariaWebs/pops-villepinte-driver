import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class KpisQueryDto {
  @IsOptional()
  @IsString()
  date?: string; // YYYY-MM-DD, defaults to today
}

export class HourlyQueryDto {
  @IsOptional()
  @IsString()
  date?: string;
}

export class TopProductsQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class SalesQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}
