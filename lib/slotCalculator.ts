/**
 * slotCalculator.ts — Pure utility for generating available appointment intervals.
 *
 * Algorithm:
 *  1. Build the set of booked ranges [start, end) from active appointments.
 *  2. Merge overlapping ranges (defensive).
 *  3. Derive free intervals between booked ranges (and at day boundaries).
 *  4. For each free interval, emit consecutive blocks of exactly `serviceDuration`
 *     starting from the interval's own start — no fixed-grid assumption.
 *  5. Blocks that would overshoot the free interval or the work-end are dropped.
 *
 * Rules enforced:
 *  - No buffer between appointments.
 *  - Cancelled appointments do NOT block time (caller must exclude them).
 *  - Free time shorter than serviceDuration is silently ignored.
 */

/** An active booking contributed by any client for the selected date. */
export interface ActiveBooking {
  /** Start time, e.g. "09:30". Only the first 5 chars are read, so "09:30:00" is also fine. */
  time: string;
  /** Total duration of the booking in minutes (sum of all selected services). */
  duration: number;
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function timeToMin(t: string): number {
  const [h, m] = t.slice(0, 5).split(':').map(Number);
  return h * 60 + m;
}

function minToTime(m: number): string {
  return (
    String(Math.floor(m / 60)).padStart(2, '0') +
    ':' +
    String(m % 60).padStart(2, '0')
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Calculate available start times for a new appointment.
 *
 * @param workStart       - Working hours start, e.g. "09:00".
 * @param workEnd         - Working hours end,   e.g. "18:00".
 * @param serviceDuration - Total duration of the selected service(s) in minutes.
 * @param activeBookings  - All non-cancelled bookings for the date (salon-wide).
 * @returns Array of available start times as "HH:mm" strings.
 */
export function calculateAvailableSlots(
  workStart: string,
  workEnd: string,
  serviceDuration: number,
  activeBookings: ActiveBooking[],
): string[] {
  if (serviceDuration <= 0) return [];

  const dayStart = timeToMin(workStart);
  const dayEnd   = timeToMin(workEnd);

  if (dayEnd - dayStart < serviceDuration) return [];

  // 1. Build booked intervals [start, end)
  const booked: [number, number][] = activeBookings
    .filter((b) => b.duration > 0)
    .map((b) => {
      const s = timeToMin(b.time);
      return [s, s + b.duration] as [number, number];
    })
    .sort((a, b) => a[0] - b[0]);

  // 2. Merge overlapping / adjacent booked intervals
  const merged: [number, number][] = [];
  for (const [s, e] of booked) {
    if (merged.length > 0 && s < merged[merged.length - 1][1]) {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);
    } else {
      merged.push([s, e]);
    }
  }

  // 3. Derive free intervals within the working day
  const free: [number, number][] = [];
  let cursor = dayStart;
  for (const [bs, be] of merged) {
    const clampedStart = Math.max(bs, dayStart);
    const clampedEnd   = Math.min(be, dayEnd);
    if (cursor < clampedStart) {
      free.push([cursor, clampedStart]);
    }
    cursor = Math.max(cursor, clampedEnd);
  }
  if (cursor < dayEnd) {
    free.push([cursor, dayEnd]);
  }

  // 4. For each free interval, generate consecutive slot start times
  const slots: string[] = [];
  for (const [fStart, fEnd] of free) {
    if (fEnd - fStart < serviceDuration) continue;
    for (let t = fStart; t + serviceDuration <= fEnd; t += serviceDuration) {
      slots.push(minToTime(t));
    }
  }

  return slots;
}
