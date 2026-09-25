import { type FunnelWorkshopSchedule } from '@/funnel/types/FunnelPage';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Toggle } from 'zyra-ui/input';

// Brasília has no daylight saving, so a fixed -03:00 is right year-round.
const DEFAULT_SCHEDULE: FunnelWorkshopSchedule = {
  timesOfDay: ['20:00'],
  utcOffsetMinutes: -180,
  minLeadMinutes: 10,
};

const parseTimesOfDay = (text: string): string[] =>
  text
    .split(',')
    .map((timeOfDay) => timeOfDay.trim())
    .filter((timeOfDay) => timeOfDay !== '');

const parseNumberOrFallback = (text: string, fallback: number): number => {
  const parsed = Number(text);

  return text.trim() !== '' && Number.isFinite(parsed) ? parsed : fallback;
};

type SettingsFunnelWorkshopScheduleFieldsProps = {
  schedule: FunnelWorkshopSchedule | undefined;
  onChange: (schedule: FunnelWorkshopSchedule | undefined) => void;
};

export const SettingsFunnelWorkshopScheduleFields = ({
  schedule,
  onChange,
}: SettingsFunnelWorkshopScheduleFieldsProps) => {
  const { t } = useLingui();

  // The times are edited as free text ("12:00, 20:00"): deriving the input
  // from the parsed array would eat the trailing comma while the user types.
  const [timesOfDayText, setTimesOfDayText] = useState(
    (schedule ?? DEFAULT_SCHEDULE).timesOfDay.join(', '),
  );

  const handleToggle = (isScheduled: boolean) => {
    if (!isScheduled) {
      onChange(undefined);

      return;
    }

    setTimesOfDayText(DEFAULT_SCHEDULE.timesOfDay.join(', '));
    onChange(DEFAULT_SCHEDULE);
  };

  return (
    <>
      <Toggle
        value={schedule !== undefined}
        aria-label={t`Scheduled sessions (automatic event)`}
        onChange={handleToggle}
      />
      {schedule !== undefined && (
        <>
          <SettingsTextInput
            instanceId="funnel-workshop-schedule-times"
            label={t`Session times (HH:mm, separated by commas)`}
            placeholder="12:00, 20:00"
            value={timesOfDayText}
            onChange={(text) => {
              setTimesOfDayText(text);
              onChange({ ...schedule, timesOfDay: parseTimesOfDay(text) });
            }}
            fullWidth
          />
          <SettingsTextInput
            instanceId="funnel-workshop-schedule-offset"
            label={t`Time zone (minutes from UTC, Brasília is -180)`}
            value={String(schedule.utcOffsetMinutes)}
            onChange={(text) =>
              onChange({
                ...schedule,
                utcOffsetMinutes: parseNumberOrFallback(
                  text,
                  DEFAULT_SCHEDULE.utcOffsetMinutes,
                ),
              })
            }
            fullWidth
          />
          <SettingsTextInput
            instanceId="funnel-workshop-schedule-min-lead"
            label={t`Minimum minutes before a session starts`}
            value={String(schedule.minLeadMinutes)}
            onChange={(text) =>
              onChange({
                ...schedule,
                minLeadMinutes: parseNumberOrFallback(
                  text,
                  DEFAULT_SCHEDULE.minLeadMinutes,
                ),
              })
            }
            fullWidth
          />
        </>
      )}
    </>
  );
};
