import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class CustomersQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['BIENVENUE', 'HABITUE', 'VIP', 'LEGENDE'])
  tier?: string;
}
