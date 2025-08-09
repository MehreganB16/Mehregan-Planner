"use client";

import { DayPicker, type DayContentProps } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskCalendarProps {
  tasks: Task[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  onEditTask: (task: Task) => void;
}

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

function CustomDayContent(props: DayContentProps) {
  const dayTasks = (props.options?.tasks as Task[] | undefined)?.filter(
    (task) => new Date(task.date).toDateString() === props.date.toDateString()
  );

  return (
    <div className="relative h-full w-full">
      <span className="relative z-10">{props.date.getDate()}</span>
      {dayTasks && dayTasks.length > 0 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-1 z-0">
          {dayTasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className={cn('h-1.5 w-1.5 rounded-full', priorityColors[task.priority])}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TaskCalendar({ tasks, selectedDate, onSelectDate, onEditTask }: TaskCalendarProps) {
  const tasksForSelectedDay = selectedDate
    ? tasks.filter((task) => new Date(task.date).toDateString() === selectedDate.toDateString())
    : [];

  return (
    <Card className="shadow-lg rounded-xl overflow-hidden">
      <CardContent className="p-2 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex justify-center">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={onSelectDate}
            className="p-0"
            classNames={{
              months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
              month: 'space-y-4',
              caption_label: 'text-lg font-medium text-foreground',
              head_cell: 'text-muted-foreground rounded-md w-10 font-normal text-sm',
              row: 'flex w-full mt-2',
              cell: 'h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
              day: 'h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent/30',
              day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
              day_today: 'bg-accent text-accent-foreground',
              day_outside: 'text-muted-foreground opacity-50',
            }}
            components={{
              DayContent: (dayProps) => <CustomDayContent {...dayProps} options={{ tasks }} />,
            }}
          />
        </div>
        <div className="md:border-l md:pl-4">
          <CardHeader className="p-2">
            <CardTitle className="text-xl font-bold text-foreground">
              {selectedDate ? format(selectedDate, 'EEEE, LLLL d') : 'No date selected'}
            </CardTitle>
            <CardDescription>
              {tasksForSelectedDay.length} task(s) for this day
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 space-y-3 max-h-96 overflow-y-auto">
            {tasksForSelectedDay.length > 0 ? (
              tasksForSelectedDay.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  className="p-3 rounded-lg border bg-card hover:bg-secondary transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-card-foreground">{task.title}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        'capitalize text-xs',
                        task.priority === 'high' && 'border-red-500 text-red-700',
                        task.priority === 'medium' && 'border-yellow-500 text-yellow-700',
                        task.priority === 'low' && 'border-green-500 text-green-700'
                      )}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10">
                <p>No tasks scheduled.</p>
                <p className="text-xs">Click "Add New Task" to begin.</p>
              </div>
            )}
          </CardContent>
        </div>
      </CardContent>
    </Card>
  );
}
