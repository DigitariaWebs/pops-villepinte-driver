import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CategoryOrderItem {
  @IsUUID()
  id: string;

  @IsInt()
  @Min(0)
  display_order: number;
}

export class ReorderCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryOrderItem)
  categories: CategoryOrderItem[];
}
