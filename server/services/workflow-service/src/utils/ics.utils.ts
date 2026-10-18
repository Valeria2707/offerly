import {
  DEFAULT_EVENT_DURATION_MINUTES,
  ICS_LINE_LIMIT
} from '../calendar/calendar.constants';

export type IcsEvent = {
  uid: string;
  summary: string;
  description?: string;
  url?: string;
  start: Date;
  allDay?: boolean;
  alarmMinutesBefore?: number;
};

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function stamp(value: Date): string {
  return `${value.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10).replace(/-/g, '');
}

function fold(line: string): string[] {
  const parts: string[] = [];
  let rest = line;
  while (rest.length > ICS_LINE_LIMIT) {
    parts.push(rest.slice(0, ICS_LINE_LIMIT));
    rest = ` ${rest.slice(ICS_LINE_LIMIT)}`;
  }
  parts.push(rest);
  return parts;
}

function eventLines(event: IcsEvent, now: Date): string[] {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${stamp(now)}`,
    `SUMMARY:${escapeText(event.summary)}`
  ];
  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${dateOnly(event.start)}`);
  } else {
    const end = new Date(
      event.start.getTime() + DEFAULT_EVENT_DURATION_MINUTES * 60 * 1000
    );
    lines.push(`DTSTART:${stamp(event.start)}`, `DTEND:${stamp(end)}`);
  }
  if (event.description)
    lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  if (event.url) lines.push(`URL:${escapeText(event.url)}`);
  if (event.alarmMinutesBefore)
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `TRIGGER:-PT${event.alarmMinutesBefore}M`,
      `DESCRIPTION:${escapeText(event.summary)}`,
      'END:VALARM'
    );
  lines.push('END:VEVENT');
  return lines;
}

export function buildCalendar(
  name: string,
  events: IcsEvent[],
  now: Date
): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Offerly//Job search calendar//UK',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(name)}`,
    ...events.flatMap((event) => eventLines(event, now)),
    'END:VCALENDAR'
  ];
  return `${lines.flatMap(fold).join('\r\n')}\r\n`;
}
