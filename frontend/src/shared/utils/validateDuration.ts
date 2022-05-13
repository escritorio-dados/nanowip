export const validateDuration = (value: string) =>
  /^([0-9]{2,3}):([0-9]{2}):([0-9]{2})$/g.test(value);

/**
 * @param duration Formato: hh:mm:ss
 */
export function convertDurationToSeconds(duration: string): number {
  const [hours, minutes, seconds] = duration.split(':');

  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}
