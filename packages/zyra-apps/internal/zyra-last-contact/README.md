# Last contacted at

A [Zyra](https://zyra.com) official application that adds a `lastContactAt` field to the standard Person object and keeps it in sync with email and calendar activity.

## What it does

- Adds a **Last Contact** (`lastContactAt`, `DATE_TIME`) field on Person, visible in the All People view.
- Sets the field to the most recent interaction whenever a synced email or calendar event is linked to a person.
- Counts a meeting as contact when it starts, via a cron-triggered logic function.
- Backfills the field from existing message and calendar history right after install.

### Application variables

| Variable | Default | Description |
| --- | --- | --- |
| `CALENDAR_CRON_INTERVAL_MINUTES` | `5` | Interval between runs of `on-calendar-event-started`. The cron scans events that started within the last interval plus a 5-minute safety overlap. |


## Learn more

- [Zyra Apps documentation](https://docs.zyra.com/developers/extend/apps/getting-started/quick-start)
- [zyra-sdk CLI reference](https://www.npmjs.com/package/zyra-sdk)
