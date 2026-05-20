import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../common/supabase/supabase.module';
import { ExpoPushService } from '../../common/push/expo-push.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { DriversQueryDto } from './dto/drivers-query.dto';

const DRIVER_FIELDS =
  'id, name, phone, role, is_blocked, is_active, vehicle, license_plate, expo_push_token, created_at, updated_at';

@Injectable()
export class AdminDriversService {
  constructor(
    @Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient,
    private readonly push: ExpoPushService,
  ) {}

  // -------- CRUD ---------------------------------------------------------

  async list(query: DriversQueryDto) {
    let qb = this.supabase
      .from('profiles')
      .select(DRIVER_FIELDS, { count: 'exact' })
      .eq('role', 'driver');

    if (query.search) {
      qb = qb.or(`name.ilike.%${query.search}%,phone.ilike.%${query.search}%`);
    }
    if (query.active === 'true') qb = qb.eq('is_active', true);
    if (query.active === 'false') qb = qb.eq('is_active', false);

    qb = qb
      .order('created_at', { ascending: false })
      .range(query.offset, query.offset + (query.limit ?? 20) - 1);

    const { data, error, count } = await qb;
    if (error) throw error;

    return {
      data: data ?? [],
      meta: {
        page: query.page ?? 1,
        pageSize: query.limit ?? 20,
        total: count ?? data?.length ?? 0,
      },
    };
  }

  async getOne(id: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select(DRIVER_FIELDS)
      .eq('id', id)
      .eq('role', 'driver')
      .maybeSingle();
    if (error || !data) throw new NotFoundException('Driver not found');
    return data;
  }

  async create(dto: CreateDriverDto) {
    // Provision Supabase auth user, then promote to driver in profiles.
    // We expect a phone-based account; email/password are optional.
    const phone = dto.phone.replace(/\s/g, '');

    const { data: existingProfile } = await this.supabase
      .from('profiles')
      .select('id, role')
      .eq('phone', phone)
      .maybeSingle();

    if (existingProfile) {
      throw new ConflictException('Phone already used by another account');
    }

    const { data: created, error: createErr } =
      await this.supabase.auth.admin.createUser({
        phone,
        email: dto.email,
        password: dto.password,
        phone_confirm: true,
        email_confirm: Boolean(dto.email),
        user_metadata: { role: 'driver', name: dto.name },
      });
    // Driver signs in with phone + password (no OTP). phone_confirm above
    // marks the phone as verified so signInWithPassword works immediately.

    if (createErr || !created.user) {
      throw new BadRequestException(
        createErr?.message ?? 'Could not create auth user',
      );
    }

    const { data: profile, error: updErr } = await this.supabase
      .from('profiles')
      .update({
        name: dto.name,
        phone,
        role: 'driver',
        vehicle: dto.vehicle ?? null,
        license_plate: dto.license_plate ?? null,
        is_active: dto.is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', created.user.id)
      .select(DRIVER_FIELDS)
      .single();

    if (updErr || !profile) {
      // Auth user was created but profile failed — best-effort cleanup.
      await this.supabase.auth.admin.deleteUser(created.user.id);
      throw new BadRequestException(updErr?.message ?? 'Failed to create driver profile');
    }
    return profile;
  }

  async update(id: string, dto: UpdateDriverDto) {
    await this.getOne(id); // ensures driver exists

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.phone !== undefined) patch.phone = dto.phone.replace(/\s/g, '');
    if (dto.vehicle !== undefined) patch.vehicle = dto.vehicle;
    if (dto.license_plate !== undefined) patch.license_plate = dto.license_plate;
    if (dto.is_active !== undefined) patch.is_active = dto.is_active;

    const { data, error } = await this.supabase
      .from('profiles')
      .update(patch)
      .eq('id', id)
      .select(DRIVER_FIELDS)
      .single();
    if (error || !data) throw new BadRequestException(error?.message ?? 'Update failed');
    return data;
  }

  async remove(id: string) {
    await this.getOne(id);
    // Cascade through auth.users → profiles via FK on profiles.id.
    const { error } = await this.supabase.auth.admin.deleteUser(id);
    if (error) throw new BadRequestException(error.message);
    return { id, deleted: true };
  }

  // -------- Orders given to a driver ------------------------------------

  async listAssignments(driverId: string, limit = 50) {
    const { data, error } = await this.supabase
      .from('order_assignments')
      .select(
        'id, order_id, status, note, assigned_at, responded_at, picked_up_at, delivered_at, orders(id, total_eur, status, customer_name, customer_phone, created_at)',
      )
      .eq('driver_id', driverId)
      .order('assigned_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  }

  // -------- Assignment from admin ---------------------------------------

  async assignOrder(orderId: string, dto: AssignDriverDto, adminId: string) {
    const { data: driver, error: dErr } = await this.supabase
      .from('profiles')
      .select('id, name, expo_push_token, is_active, role')
      .eq('id', dto.driver_id)
      .maybeSingle();
    if (dErr || !driver || driver.role !== 'driver') {
      throw new NotFoundException('Driver not found');
    }
    if (driver.is_active === false) {
      throw new BadRequestException('Driver is not active');
    }

    const { data: order, error: oErr } = await this.supabase
      .from('orders')
      .select('id, customer_name, total_eur, status')
      .eq('id', orderId)
      .maybeSingle();
    if (oErr || !order) throw new NotFoundException('Order not found');

    // Cancel any prior pending assignment for this order.
    await this.supabase
      .from('order_assignments')
      .update({
        status: 'cancelled',
        responded_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .eq('status', 'pending');

    const { data: assignment, error } = await this.supabase
      .from('order_assignments')
      .insert({
        order_id: orderId,
        driver_id: dto.driver_id,
        status: 'pending',
        note: dto.note ?? null,
        assigned_by: adminId,
      })
      .select('*')
      .single();
    if (error || !assignment) {
      throw new BadRequestException(error?.message ?? 'Assignment failed');
    }

    if (driver.expo_push_token) {
      void this.push.send({
        to: driver.expo_push_token,
        title: 'Nouvelle commande à récupérer',
        body: `Commande ${order.id} — ${order.customer_name}`,
        sound: 'default',
        priority: 'high',
        channelId: 'orders',
        data: {
          type: 'order_assignment',
          assignment_id: assignment.id,
          order_id: order.id,
        },
      });
    }

    return assignment;
  }

  async cancelAssignment(orderId: string, assignmentId: string) {
    const { data, error } = await this.supabase
      .from('order_assignments')
      .update({
        status: 'cancelled',
        responded_at: new Date().toISOString(),
      })
      .eq('id', assignmentId)
      .eq('order_id', orderId)
      .select('*')
      .single();
    if (error || !data) throw new NotFoundException('Assignment not found');
    return data;
  }

  async listOrderAssignments(orderId: string) {
    const { data, error } = await this.supabase
      .from('order_assignments')
      .select(
        'id, order_id, status, note, assigned_at, responded_at, picked_up_at, delivered_at, driver:profiles!order_assignments_driver_id_fkey(id, name, phone, vehicle, license_plate)',
      )
      .eq('order_id', orderId)
      .order('assigned_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
}
