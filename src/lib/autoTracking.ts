/**
 * Calculates the current expected status of an order based on preparationStartedAt and deliveryDays.
 * Used at read-time (no cron needed) for real-time status computation.
 */

export type AutoStatus = 'PROCESSING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED';

export interface AutoStatusResult {
  currentStatus: AutoStatus;
  shippedAt: Date;
  inTransitAt: Date;
  deliveredAt: Date;
  progressPercent: number; // 0-100
}

/**
 * Returns the expected status transition schedule for an order in auto-tracking mode.
 * 
 * Timeline:
 *   T+0       → PROCESSING (En Préparation)
 *   T+2j      → SHIPPED
 *   T+2j+48h  → IN_TRANSIT (if deliveryDays=3)
 *   T+2j+72h  → IN_TRANSIT (if deliveryDays=5)
 *   T+2j+120h → IN_TRANSIT (if deliveryDays=7)
 *   T+deliveryDays → DELIVERED
 */
export function computeAutoStatus(
  preparationStartedAt: Date,
  deliveryDays: number
): AutoStatusResult {
  const start = new Date(preparationStartedAt);

  // T+2 days → SHIPPED
  const shippedAt = new Date(start);
  shippedAt.setDate(shippedAt.getDate() + 2);

  // IN_TRANSIT delay after SHIPPED
  // 3j → 48h after shipped (total: 4 days from start)
  // 5j → 72h after shipped (total: 5 days from start)
  // 7j → 120h after shipped (total: 7 days from start)
  const inTransitHoursAfterShipped = deliveryDays === 3 ? 48 : deliveryDays === 5 ? 72 : 120;
  const inTransitAt = new Date(shippedAt);
  inTransitAt.setHours(inTransitAt.getHours() + inTransitHoursAfterShipped);

  // DELIVERED at T+deliveryDays
  const deliveredAt = new Date(start);
  deliveredAt.setDate(deliveredAt.getDate() + deliveryDays);

  const now = new Date();

  let currentStatus: AutoStatus;
  if (now >= deliveredAt) {
    currentStatus = 'DELIVERED';
  } else if (now >= inTransitAt) {
    currentStatus = 'IN_TRANSIT';
  } else if (now >= shippedAt) {
    currentStatus = 'SHIPPED';
  } else {
    currentStatus = 'PROCESSING';
  }

  // Progress: 0% at start, 100% at deliveredAt
  const totalMs = deliveredAt.getTime() - start.getTime();
  const elapsedMs = Math.min(now.getTime() - start.getTime(), totalMs);
  const progressPercent = totalMs > 0 ? Math.max(0, Math.round((elapsedMs / totalMs) * 100)) : 0;

  return { currentStatus, shippedAt, inTransitAt, deliveredAt, progressPercent };
}

/**
 * Formats a date for display (locale-aware)
 */
export function formatTrackingDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
