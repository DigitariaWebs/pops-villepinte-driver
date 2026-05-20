import { Injectable, Logger } from '@nestjs/common';

export type ExpoPushPayload = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
};

@Injectable()
export class ExpoPushService {
  private readonly logger = new Logger(ExpoPushService.name);
  private readonly endpoint = 'https://exp.host/--/api/v2/push/send';

  async send(payload: ExpoPushPayload | ExpoPushPayload[]): Promise<void> {
    const messages = Array.isArray(payload) ? payload : [payload];
    const valid = messages.filter((m) => m.to && m.to.startsWith('Expo'));
    if (valid.length === 0) {
      this.logger.debug('No valid Expo push tokens — skipping send');
      return;
    }

    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(valid),
      });
      if (!res.ok) {
        const text = await res.text();
        this.logger.warn(
          `Expo push failed: HTTP ${res.status} ${res.statusText} — ${text}`,
        );
      }
    } catch (err) {
      this.logger.error('Expo push request threw', err as Error);
    }
  }
}
