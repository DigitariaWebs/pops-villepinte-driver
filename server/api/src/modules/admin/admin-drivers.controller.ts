import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminDriversService } from './admin-drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { DriversQueryDto } from './dto/drivers-query.dto';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminDriversController {
  constructor(private readonly drivers: AdminDriversService) {}

  @Get('drivers')
  list(@Query() query: DriversQueryDto) {
    return this.drivers.list(query);
  }

  @Post('drivers')
  create(@Body() dto: CreateDriverDto) {
    return this.drivers.create(dto);
  }

  @Get('drivers/:id')
  getOne(@Param('id') id: string) {
    return this.drivers.getOne(id);
  }

  @Patch('drivers/:id')
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto) {
    return this.drivers.update(id, dto);
  }

  @Delete('drivers/:id')
  remove(@Param('id') id: string) {
    return this.drivers.remove(id);
  }

  @Get('drivers/:id/orders')
  orders(@Param('id') id: string) {
    return this.drivers.listAssignments(id);
  }

  @Get('orders/:id/assignments')
  orderAssignments(@Param('id') id: string) {
    return this.drivers.listOrderAssignments(id);
  }

  @Post('orders/:id/assign')
  assign(
    @Param('id') id: string,
    @Body() dto: AssignDriverDto,
    @Req() req: any,
  ) {
    return this.drivers.assignOrder(id, dto, req.user?.id);
  }

  @Delete('orders/:orderId/assignments/:assignmentId')
  cancelAssignment(
    @Param('orderId') orderId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.drivers.cancelAssignment(orderId, assignmentId);
  }
}
