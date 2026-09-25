import { formatWorkshopCountdown } from '@/funnel/utils/formatWorkshopCountdown';

describe('formatWorkshopCountdown', () => {
  it('should pad hours, minutes and seconds', () => {
    expect(formatWorkshopCountdown(3 * 3600 + 4 * 60 + 5)).toBe('03:04:05');
  });

  it('should not wrap hours at 24', () => {
    expect(formatWorkshopCountdown(30 * 3600)).toBe('30:00:00');
  });

  it('should show zeros when the time is up or negative', () => {
    expect(formatWorkshopCountdown(0)).toBe('00:00:00');
    expect(formatWorkshopCountdown(-12)).toBe('00:00:00');
  });

  it('should drop fractions of a second', () => {
    expect(formatWorkshopCountdown(59.9)).toBe('00:00:59');
  });
});
