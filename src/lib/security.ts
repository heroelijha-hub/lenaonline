import crypto from 'crypto';

export function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function safeJsonLd(obj: any): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

/**
 * Generates an HMAC token to authorize view access to a specific order without authentication.
 */
export function getOrderAccessToken(orderId: string): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.CRON_SECRET || 'order-access-secret-lena';
  return crypto.createHmac('sha256', secret).update(`order:${orderId}`).digest('hex').slice(0, 32);
}

/**
 * Verifies an order access token using timing-safe comparison.
 */
export function verifyOrderAccessToken(orderId: string, token?: string | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const expected = getOrderAccessToken(orderId);
  if (token.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}
