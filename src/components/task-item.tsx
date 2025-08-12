
'use client';

import { format, isPast, parse, setHours, setMinutes } from 'date-fns';
import { AlertTriangle, Calendar, Check, ChevronDown, ChevronUp, Minus, X, WandSparkles } from 'lucide-react';
import * as React from 'react';

import type { Task, Priority } from '@/lib/types';
import { cn, isPersian } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Card, CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Progress } from './ui/progress';
import { TaskItemActions } from './task-item-actions';


interface TaskItemProps {
  task: Task;
  subtasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (task: Task) => void;
  onAddSubTasks: (parentId: string, subTasks: Omit<Task, 'id'| 'completed' | 'parentId' | 'createdAt'>[]) => void;
  onAddToCalendar: (task: Task) => void;
  accordionTrigger?: React.ReactNode;
  onBreakDownTask: (task: Task) => void;
}

const priorityConfig: Record<Priority, { label: string; color: string; icon: React.ElementType, borderColor: string; checkboxColor: string }> = {
    urgent: { label: 'Urgent', color: 'border-transparent bg-red-500 text-red-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-red-50 dark:hover:bg-red-900/80', icon: AlertTriangle, borderColor: 'border-red-500/50 dark:border-red-900/80', checkboxColor: 'border-red-600' },
    high: { label: 'High', color: 'border-transparent bg-orange-500 text-orange-50 hover:bg-orange-500/80 dark:bg-orange-800 dark:text-orange-50 dark:hover:bg-orange-800/80', icon: ChevronUp, borderColor: 'border-orange-500/50 dark:border-orange-800/80', checkboxColor: 'border-orange-500' },
    medium: { label: 'Medium', color: 'border-transparent bg-blue-500 text-blue-50 hover:bg-blue-500/80 dark:bg-blue-800 dark:text-blue-50 dark:hover:bg-blue-800/80', icon: Minus, borderColor: 'border-blue-500/50 dark:border-blue-800/80', checkboxColor: 'border-blue-500' },
    low: { label: 'Low', color: 'border-transparent bg-gray-500 text-gray-50 hover:bg-gray-500/80 dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-700/80', icon: ChevronDown, borderColor: 'border-gray-500/50 dark:border-gray-700/80', checkboxColor: 'border-gray-400' },
};

const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

export function TaskItem({ task, subtasks, onToggle, onDelete, onUpdate, onAddSubTasks, onAddToCalendar, onBreakDownTask, accordionTrigger }: TaskItemProps) {
  const isOverdue = task.dueDate && !task.completed && isPast(new Date(task.dueDate));
  const { label, color, icon: Icon, borderColor, checkboxColor } = priorityConfig[task.priority];
  const [time, setTime] = React.useState(task.dueDate ? format(new Date(task.dueDate), "HH:mm") : "");


  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  const hasPersian = isPersian(task.title) || (task.description && isPersian(task.description));

  const handlePriorityChange = (newPriority: string) => {
    if (priorities.includes(newPriority as Priority)) {
        onUpdate({ ...task, priority: newPriority as Priority });
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    let newDate = date;
    if (newDate) {
        try {
            const parsedTime = parse(time, "HH:mm", new Date());
            newDate = setMinutes(setHours(newDate, parsedTime.getHours()), parsedTime.getMinutes());
        } catch(e) {
            console.error("Invalid time format, using date only");
        }
    }
    onUpdate({ ...task, dueDate: newDate });
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
    if (task.dueDate) {
        let newDate = new Date(task.dueDate);
        try {
            const parsedTime = parse(e.target.value, "HH:mm", new Date());
            newDate = setMinutes(setHours(newDate, parsedTime.getHours()), parsedTime.getMinutes());
            onUpdate({ ...task, dueDate: newDate });
        } catch(e) {
            console.error("Invalid time format", e);
        }
    }
  }
  
  const backgroundClass = isOverdue
    ? 'bg-destructive/10 dark:bg-destructive/20'
    : task.completed
    ? 'bg-muted/50'
    : 'bg-card';


  return (
    <Card className={cn(
        'transition-all hover:shadow-lg w-full rounded-lg relative group',
        'border-l-4',
        borderColor,
        backgroundClass,
        isOverdue && !task.completed && 'animate-pulse group-hover:animation-paused'
    )}>
      <CardContent className="p-3 sm:p-4 flex items-start gap-3">
        <div className="flex items-center pt-1">
          {accordionTrigger}
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={() => onToggle(task.id)}
            className={cn("mt-0", checkboxColor)}
            aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
          />
        </div>
        <div className="grid gap-1.5 flex-1">
          <label
            htmlFor={`task-${task.id}`}
            className={cn(
              'font-semibold cursor-pointer',
              task.completed && 'line-through text-muted-foreground',
              hasPersian && 'font-persian'
            )}
          >
            {task.title}
          </label>
          {task.description && (
            <p className={cn('text-sm text-muted-foreground', task.completed && 'line-through', hasPersian && 'font-persian')}>
              {task.description}
            </p>
          )}
          {subtasks.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Progress value={progress} className="h-2 w-24" />
              <span className="text-xs text-muted-foreground">{completedSubtasks}/{subtasks.length}</span>
            </div>
          )}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
            {task.dueDate && (
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" type="button" className={cn(
                            "flex items-center gap-1 -mx-2 -my-1 h-auto px-2 py-1 text-sm",
                             isOverdue && !task.completed && "text-destructive font-semibold hover:text-destructive"
                        )}>
                            <Calendar className="h-4 w-4" />
                            <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy p')}</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                            mode="single"
                            selected={new Date(task.dueDate)}
                            onSelect={(date) => handleDateChange(date)}
                            initialFocus
                        />
                        <div className="p-2 border-t border-border">
                            <Input 
                                type="time"
                                value={time}
                                onChange={handleTimeChange}
                            />
                        </div>
                        <div className="p-2 border-t border-border">
                            <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                className="w-full justify-center text-muted-foreground"
                                onClick={() => onUpdate({ ...task, dueDate: undefined })}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Clear
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            )}
             {task.completionDate && (
                <div className="flex items-center gap-1 text-green-600">
                    <Check className="h-4 w-4" />
                    <span>Completed: {format(new Date(task.completionDate), 'MMM d, yyyy')}</span>
                </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge className={cn('cursor-pointer', color)} variant="secondary">
                    <Icon className="h-3 w-3 mr-1"/>
                    {label}
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={task.priority} onValueChange={handlePriorityChange}>
                    {priorities.map(p => {
                        const config = priorityConfig[p];
                        return (
                            <DropdownMenuRadioItem key={p} value={p} className="flex gap-2 capitalize">
                                <config.icon className="h-4 w-4"/>
                                {p}
                            </DropdownMenuRadioItem>
                        )
                    })}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center self-start space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TaskItemActions
                task={task}
                onUpdate={onUpdate}
                onAddSubTasks={onAddSubTasks}
                onDelete={onDelete}
                onAddToCalendar={onAddToCalendar}
                onBreakDownTask={onBreakDownTask}
            />
        </div>
      </CardContent>
    </Card>
  );
}
