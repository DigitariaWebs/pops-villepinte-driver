import type { Env } from './env.validation';

export const configuration = (): Env => process.env as unknown as Env;
