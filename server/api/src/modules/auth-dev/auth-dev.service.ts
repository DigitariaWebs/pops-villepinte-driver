import { randomBytes } from 'crypto';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import {
  SUPABASE_ADMIN,
  SUPABASE_ANON,
} from '../../common/supabase/supabase.module';
import { normalizeFrenchMobile } from '../../common/utils/phone';
import type { Env } from '../../config/env.validation';

const DEV_OTP_CODE = '000000';

@Injectable()
export class AuthDevService {
  constructor(
    private readonly cfg: ConfigService<Env, true>,
    @Inject(SUPABASE_ADMIN) private readonly admin: SupabaseClient,
    @Inject(SUPABASE_ANON) private readonly anon: SupabaseClient,
  ) {}

  async signIn(rawPhone: string, code: string) {
    if (!this.cfg.get('DEV_AUTH_ENABLED', { infer: true })) {
      throw new NotFoundException();
    }
    if (code !== DEV_OTP_CODE) {
      throw new UnauthorizedException('Invalid dev OTP');
    }

    const phone = normalizeFrenchMobile(rawPhone);
    if (!phone) throw new BadRequestException('Invalid phone format');

    const password = randomBytes(24).toString('hex');
    const existing = await this.findUserByPhone(phone);

    if (existing) {
      const { error } = await this.admin.auth.admin.updateUserById(
        existing.id,
        { password, phone_confirm: true },
      );
      if (error) throw error;
    } else {
      const { error } = await this.admin.auth.admin.createUser({
        phone,
        password,
        phone_confirm: true,
      });
      if (error) throw error;
    }

    const { data, error } = await this.anon.auth.signInWithPassword({
      phone,
      password,
    });
    if (error || !data.session) {
      throw new UnauthorizedException(
        error?.message ?? 'Failed to mint dev session',
      );
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: { id: data.user?.id, phone: data.user?.phone },
    };
  }

  private async findUserByPhone(phoneE164: string): Promise<User | null> {
    const candidates = new Set([phoneE164, phoneE164.replace(/^\+/, '')]);
    let page = 1;
    while (page <= 10) {
      const { data, error } = await this.admin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (error) throw error;
      const found = data.users.find(
        (u) => u.phone && candidates.has(u.phone),
      );
      if (found) return found;
      if (data.users.length < 200) return null;
      page++;
    }
    return null;
  }
}
