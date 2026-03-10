/**
 * slotCalculator.ts — Pure utility for generating available appointment slots.
 *
 * Logic:
 *  1. Working day is 09:00–18:00.
 *  2. Slots start at shiftStart and increment by serviceDuration.
 *  3. A slot is valid when: current + serviceDuration <= shiftEnd
 *  4. Existing bookings are checked for overlap (buffer applied to booked ranges).
 */

const WORK_START_MIN = 9 * 60;  // 540
const WORK_END_MIN   = 18 * 60; // 1080

export interface BookedSlot {
  /** Start time of the existing booking, e.g. "09:30" */
  time: string;
  /** Duration of the existing booking in minutes */
  duration: number;
}

/**
 * Calculate available start times for a new appointment.
 *
 * @param date             - The date being checked (unused in pure calculation;
 *                           caller filters appointments by date before passing).
 * @param serviceDuration  - Total duration of the selected service(s) in minutes.
 * @param existingBookings - Active bookings on that date (cancelled excluded by caller).
 * @param bufferMinutes    - Gap between appointments (pass 0 for no buffer).
 * @returns Array of available start times as "HH:mm" strings, e.g. ["09:00", "09:30"].
 */
export function calculateSlots(
  _date: Date,
  serviceDuration: number,
  existingBookings: BookedSlot[],
  bufferMinutes: number = 0,
): string[] {
  if (serviceDuration <= 0) return [];

  const bookedRanges: Array<[number, number]> = existingBookings.map(
    ({ time, duration }) => {
      const [h, m] = time.split(':').map(Number);
      const start = h * 60 + m;
      return [start, start + duration + bufferMinutes];
    },
  );

  const slots: string[] = [];

  for (
    let t = WORK_START_MIN;
    t + serviceDuration <= WORK_END_MIN;
    t += serviceDuration
  ) {
    const slotEnd = t + serviceDuration;

    const hasConflict = bookedRanges.some(
      ([bStart, bEnd]) => t < bEnd && slotEnd > bStart,
    );

    if (!hasConflict) {
      const hours = Math.floor(t / 60);
      const mins  = t % 60;
      slots.push(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`,
      );
    }
  }

  return slots;
}
