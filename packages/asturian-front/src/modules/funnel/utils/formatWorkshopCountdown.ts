const pad = (value: number) => String(value).padStart(2, '0');

// "HH:MM:SS". Hours are not wrapped at 24 so a session tomorrow still reads
// as a single, honest countdown (e.g. 19:42:05).
export const formatWorkshopCountdown = (totalSeconds: number): string => {
  const safeSeconds = Math.max(Math.floor(totalSeconds), 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
