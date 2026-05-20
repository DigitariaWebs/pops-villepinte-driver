import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../common/supabase/supabase.module';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { RespondAssignmentDto } from './dto/respond-assignment.dto';

// Endpoints used by the driver mobile app. Auth: any signed-in driver,
// scoped to their own data.
@Controller('driver')
export class DriverSelfController {
  constructor(
    @Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient,
  ) {}

  private requireDriver(req: any): string {
    const role = req.user?.role;
    const id = req.user?.id;
    if (!id || role !== 'driver') {
      throw new ForbiddenException('Driver access required');
    }
    return id;
  }

  @Post('push-token')
  async registerToken(@Body() dto: RegisterPushTokenDto, @Req() req: any) {
    const driverId = this.requireDriver(req);
    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        expo_push_token: dto.expo_push_token,
        updated_at: new Date().toISOString(),
      })
      .eq('id', driverId)
      .select('id, expo_push_token')
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  @Get('assignments')
  async list(@Req() req: any, @Query('status') status?: string) {
    const driverId = this.requireDriver(req);
    let qb = this.supabase
      .from('order_assignments')
      .select(
        'id, order_id, status, note, assigned_at, responded_at, picked_up_at, delivered_at, orders(id, total_eur, customer_name, customer_phone, notes, created_at, estimated_ready_at, status)',
      )
      .eq('driver_id', driverId)
      .order('assigned_at', { ascending: false });
    if (status) qb = qb.eq('status', status);
    const { data, error } = await qb;
    if (error) throw error;
    return data ?? [];
  }

  @Get('assignments/:id')
  async getOne(@Param('id') id: string, @Req() req: any) {
    const driverId = this.requireDriver(req);
    const { data, error } = await this.supabase
      .from('order_assignments')
      .select(
        'id, order_id, status, note, assigned_at, responded_at, picked_up_at, delivered_at, orders(id, total_eur, customer_name, customer_phone, notes, created_at, estimated_ready_at, status, order_items(*))',
      )
      .eq('id', id)
      .eq('driver_id', driverId)
      .maybeSingle();
    if (error || !data) throw new NotFoundException('Assignment not found');
    return data;
  }

  @Patch('assignments/:id/respond')
  async respond(
    @Param('id') id: string,
    @Body() dto: RespondAssignmentDto,
    @Req() req: any,
  ) {
    const driverId = this.requireDriver(req);

    const { data: row, error: getErr } = await this.supabase
      .from('order_assignments')
      .select('id, driver_id, status')
      .eq('id', id)
      .maybeSingle();
    if (getErr || !row) throw new NotFoundException('Assignment not found');
    if (row.driver_id !== driverId) {
      throw new ForbiddenException('Not your assignment');
    }
    if (row.status !== 'pending') {
      throw new BadRequestException('Assignment already responded');
    }

    const { data, error } = await this.supabase
      .from('order_assignments')
      .update({
        status: dto.status,
        note: dto.note ?? null,
        responded_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }
}
