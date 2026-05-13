import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../supabase/supabase.module';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { Env } from '../../config/env.validation';

interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  phone?: string;
  role?: string;
  exp: number;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService<Env, true>,
    @Inject(SUPABASE_ADMIN) private readonly admin: SupabaseClient,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest();
    const header: string | undefined = req.headers?.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = header.slice('Bearer '.length).trim();

    let payload: SupabaseJwtPayload;
    try {
      payload = await this.jwt.verifyAsync<SupabaseJwtPayload>(token, {
        secret: this.cfg.get('SUPABASE_JWT_SECRET', { infer: true }),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const { data, error } = await this.admin
      .from('profiles')
      .select('id, name, phone, order_count, role, is_blocked')
      .eq('id', payload.sub)
      .maybeSingle();

    if (error || !data) {
      throw new UnauthorizedException('Profile not found');
    }

    if (data.is_blocked === true) {
      throw new ForbiddenException('Account suspended');
    }

    req.user = {
      id: payload.sub,
      phone: payload.phone ?? data.phone ?? null,
      email: payload.email ?? null,
      role: data.role,
      profile: {
        id: data.id,
        name: data.name,
        phone: data.phone,
        orderCount: data.order_count,
        role: data.role,
      },
    };
    return true;
  }
}
