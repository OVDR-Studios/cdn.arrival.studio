# Black Market Overrides

Each override replaces the black market stock while it's active.

- The game re-downloads the override file every 30 seconds.
- If more than one override is active at the same time, the one **higher in the list** wins. Put specific dates above weekly schedules.
- A broken override (bad id, bad date, bad timezone...) is skipped and logged. The rest still work.

## Animatronics (required)

Up to 3 slots. Each slot is one of:

| Slot | Meaning |
|---|---|
| `"lally"` | That animatronic at its normal price |
| `{ "id": "lally", "price": 500 }` | That animatronic at a custom price |
| `"random"` | A random pick from the normal roster |

- Ids without a namespace are fnafmw ids. Animatronics from other mods use `"othermod:thing"`.
- If you give fewer than 3 slots, the rest are filled randomly.

## One-off windows

| Field | Example | Meaning |
|---|---|---|
| `day` | `"2026-12-25"` | That whole day |
| `start` | `"2026-12-25"` | From the start of that day |
| `start` | `"2026-12-25T18:00"` | From 18:00 in the override's timezone |
| `start` | `"2026-12-25T18:00:00Z"` | Exact EST moment (offsets like `+02:00` work too) |
| `end` | same formats as `start` | A plain date means "through the end of that day" |
| `days` / `hours` / `minutes` | `1.5` | How long it lasts after `day`/`start`. They add up and decimals are fine. Ignored if `end` is set |

With no `day`, `start` or `end`, the override is active forever (or forever on its schedule, below).

## Repeating schedule

| Field | Example | Meaning |
|---|---|---|
| `weekdays` | `["fri", "saturday"]` | Full names or 3-letter short forms |
| `dates` | `[13, 31]` | Days of the month, 1-31 |
| `months` | `["oct", 12]` | Month names, short forms, or numbers 1-12 |
| `times` | `["12:00-14:00", "18:00-22:00"]` | Times of day. No `times` means all day |

- Every field you add narrows it further: `weekdays: "fri"` + `dates: 13` means only Friday the 13th.
- A time range can cross midnight: `"22:00-02:00"`. The window belongs to the day it starts.
- Use `"24:00"` for end of day.
- `day`/`start`/`end`/`days`/`hours`/`minutes` still apply as outer limits on the schedule.
- Any field can be a single value or a list: `"weekdays": "fri"` and `"weekdays": ["fri"]` are the same.

## Timezone

| Field | Example | Meaning |
|---|---|---|
| `timezone` | `"America/New_York"` | Timezone for everything above. Defaults to EST |

Use names from the [tz database list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

## Examples

Christmas Day, New York time:

```json
{
  "day": "2026-12-25",
  "timezone": "America/New_York",
  "animatronics": [
    { "id": "lally", "price": 1 },
    { "id": "phantom_freddy", "price": 1 },
    "random"
  ]
}
```

Every Halloween, all day UTC, every year:

```json
{
  "months": "oct",
  "dates": 31,
  "animatronics": [
    { "id": "phantom_freddy", "price": 666 },
    "random",
    "random"
  ]
}
```

Every Friday the 13th, whatever month it lands in:

```json
{
  "weekdays": "fri",
  "dates": 13,
  "animatronics": [
    { "id": "lally", "price": 1313 },
    "random",
    "random"
  ]
}
```

December 2026 weekends only, lunch and evening windows, London time:

```json
{
  "start": "2026-12-01",
  "end": "2026-12-31",
  "weekdays": ["sat", "sun"],
  "times": ["12:00-14:00", "18:00-22:00"],
  "timezone": "Europe/London",
  "animatronics": [
    { "id": "lally", "price": 5000 },
    "random",
    "random"
  ]
}
```

Every Friday and Saturday night, 10pm to 2am New York time (Friday's window runs into early Saturday morning):

```json
{
  "weekdays": ["fri", "sat"],
  "times": "22:00-02:00",
  "timezone": "America/New_York",
  "animatronics": [
    "random",
    { "id": "phantom_freddy", "price": 2500 },
    "random"
  ]
}
```

One-off flash sale, Nov 20th at 6pm LA time, lasting 1h 30m:

```json
{
  "start": "2026-11-20T18:00",
  "hours": 1,
  "minutes": 30,
  "timezone": "America/Los_Angeles",
  "animatronics": [
    { "id": "lally", "price": 1 },
    { "id": "lally", "price": 1 },
    { "id": "lally", "price": 1 }
  ]
}
```

## Full file

All of the above together, in priority order:

```json
{
  "overrides": [
    {
      "day": "2026-12-25",
      "timezone": "America/New_York",
      "animatronics": [
        { "id": "lally", "price": 1 },
        { "id": "phantom_freddy", "price": 1 },
        "random"
      ]
    },
    {
      "months": "oct",
      "dates": 31,
      "animatronics": [
        { "id": "phantom_freddy", "price": 666 },
        "random",
        "random"
      ]
    },
    {
      "weekdays": "fri",
      "dates": 13,
      "animatronics": [
        { "id": "lally", "price": 1313 },
        "random",
        "random"
      ]
    },
    {
      "start": "2026-12-01",
      "end": "2026-12-31",
      "weekdays": ["sat", "sun"],
      "times": ["12:00-14:00", "18:00-22:00"],
      "timezone": "Europe/London",
      "animatronics": [
        { "id": "lally", "price": 5000 },
        "random",
        "random"
      ]
    },
    {
      "weekdays": ["fri", "sat"],
      "times": "22:00-02:00",
      "timezone": "America/New_York",
      "animatronics": [
        "random",
        { "id": "phantom_freddy", "price": 2500 },
        "random"
      ]
    },
    {
      "start": "2026-11-20T18:00",
      "hours": 1,
      "minutes": 30,
      "timezone": "America/Los_Angeles",
      "animatronics": [
        { "id": "lally", "price": 1 },
        { "id": "lally", "price": 1 },
        { "id": "lally", "price": 1 }
      ]
    }
  ]
}
```
