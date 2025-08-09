"use client"

import type { Task } from './types';
import { format } from 'date-fns';

const toIcsDate = (date: Date): string => {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
};

export const exportToIcs = (tasks: Task[]) => {
  let icsString = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PlanRight//NONSGML v1.0//EN',
  ].join('\r\n');

  tasks.forEach(task => {
    const startDate = new Date(task.date);
    const endDate = new Date(startDate.getTime() + task.duration * 60000);

    const event = [
      'BEGIN:VEVENT',
      `UID:${task.id}@planright.app`,
      `DTSTAMP:${toIcsDate(new Date())}`,
      `DTSTART:${toIcsDate(startDate)}`,
      `DTEND:${toIcsDate(endDate)}`,
      `SUMMARY:${task.title}`,
      `DESCRIPTION:${task.description || ''}`,
      `X-PRIORITY:${task.priority === 'high' ? 1 : task.priority === 'medium' ? 5 : 9}`,
    ];

    if (task.recurring !== 'none') {
        let rrule = `RRULE:FREQ=${task.recurring.toUpperCase()}`;
        event.push(rrule);
    }

    event.push('END:VEVENT');
    icsString += '\r\n' + event.join('\r\n');
  });

  icsString += '\r\nEND:VCALENDAR';

  const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'PlanRight_Schedule.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
