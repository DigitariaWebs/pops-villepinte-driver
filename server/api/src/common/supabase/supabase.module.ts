import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Env } from '../../config/env.validation';

export const SUPABASE_ADMIN = Symbol('SUPABASE_ADMIN');
export const SUPABASE_ANON = Symbol('SUPABASE_ANON');

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_ADMIN,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService<Env, true>): SupabaseClient =>
        createClient(
          cfg.get('SUPABASE_URL', { infer: true }),
          cfg.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true }),
          { auth: { persistSession: false, autoRefreshToken: false } },
        ),
    },
    {
      provide: SUPABASE_ANON,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService<Env, true>): SupabaseClient =>
        createClient(
          cfg.get('SUPABASE_URL', { infer: true }),
          cfg.get('SUPABASE_ANON_KEY', { infer: true }),
          { auth: { persistSession: false, autoRefreshToken: false } },
        ),
    },
  ],
  exports: [SUPABASE_ADMIN, SUPABASE_ANON],
})
export class SupabaseModule {}
