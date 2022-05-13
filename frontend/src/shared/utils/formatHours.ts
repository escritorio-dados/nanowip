export function formatHours(hours: number): string | null {
  if (hours === 0) {
    return null;
  }

  const hoursFixed = Math.floor(hours);

  const minutes = (hours - hoursFixed) * 60;

  const minutesFixed = Math.floor(minutes);

  const seconds = Math.ceil((minutes - minutesFixed) * 60);

  const minutesString = minutesFixed < 10 ? `0${minutesFixed}` : minutesFixed;

  const secondsString = seconds < 10 ? `0${seconds}` : seconds;

  return `${hoursFixed}:${minutesString}:${secondsString}`;
}
