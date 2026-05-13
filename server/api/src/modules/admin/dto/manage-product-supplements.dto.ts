import { IsArray, IsUUID } from 'class-validator';

export class ManageProductSupplementsDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  supplement_ids: string[];
}
