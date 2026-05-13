import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminCustomersService } from './admin-customers.service';
import { CustomersQueryDto } from './dto/customers-query.dto';

@Controller('admin/customers')
@UseGuards(AdminGuard)
export class AdminCustomersController {
  constructor(private readonly customersService: AdminCustomersService) {}

  @Get()
  getCustomers(@Query() query: CustomersQueryDto) {
    return this.customersService.getCustomers(query);
  }

  @Get(':id')
  getCustomer(@Param('id') id: string) {
    return this.customersService.getCustomerDetail(id);
  }

  @Patch(':id/block')
  blockCustomer(@Param('id') id: string) {
    return this.customersService.blockCustomer(id);
  }

  @Patch(':id/unblock')
  unblockCustomer(@Param('id') id: string) {
    return this.customersService.unblockCustomer(id);
  }
}
