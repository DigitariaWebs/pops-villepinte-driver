import { IsOptional, IsString, IsUUID } from 'class-validator';

export class MenuProductsQueryDto {
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
