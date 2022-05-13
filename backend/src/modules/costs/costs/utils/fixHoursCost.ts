import { setHours, setMilliseconds, setMinutes, setSeconds } from 'date-fns';

export function fixHoursCost(date?: Date, hours?: number) {
  if (!date) {
    return null;
  }

  const hoursFixed = hours !== undefined ? hours : 12;

  return setMilliseconds(setSeconds(setMinutes(setHours(date, hoursFixed), 0), 0), 0);
}
