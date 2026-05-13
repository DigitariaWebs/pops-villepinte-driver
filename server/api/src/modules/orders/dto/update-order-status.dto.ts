import { IsIn, IsString } from 'class-validator';
import { OrderStatus } from '../../../shared/types';

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['preparing', 'ready', 'picked_up'])
  status: OrderStatus;
}
