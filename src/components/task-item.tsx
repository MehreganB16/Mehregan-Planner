
'use client';

import { format, isPast, parse, setHours, setMinutes } from 'date-fns';
import { AlertTriangle, Calendar, Check, ChevronDown, ChevronUp, Minus, X } from 'lucide-react';
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
}

const priorityConfig: Record<Priority, { label: string; color: string; icon: React.ElementType, borderColor: string; checkboxColor: string }> = {
    urgent: { label: 'Urgent', color: 'bg-red-600 text-white hover:bg-red-600/90', icon: AlertTriangle, borderColor: 'border-red-600', checkboxColor: 'border-red-600' },
    high: { label: 'High', color: 'bg-accent text-accent-foreground hover:bg-accent/90', icon: ChevronUp, borderColor: 'border-accent', checkboxColor: 'border-accent' },
    medium: { label: 'Medium', color: 'bg-primary text-primary-foreground hover:bg-primary/90', icon: Minus, borderColor: 'border-primary', checkboxColor: 'border-primary' },
    low: { label: 'Low', color: 'bg-green-100/50 text-green-800 border-green-200/50 hover:bg-green-100/80 dark:bg-green-400/50 dark:text-green-950 dark:border-green-800/50 dark:hover:bg-green-400/90', icon: ChevronDown, borderColor: 'border-green-200/50 dark:border-green-800/50', checkboxColor: 'border-green-400/50 dark:border-green-700/50' },
};

const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

export function TaskItem({ task, subtasks, onToggle, onDelete, onUpdate, onAddSubTasks, onAddToCalendar, accordionTrigger }: TaskItemProps) {
  const isOverdue = task.dueDate && !task.completed && isPast(new Date(task.dueDate));
  const { label, color, icon: Icon, borderColor } = priorityConfig[task.priority];
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
        'transition-all hover:shadow-md border-l-4 w-full rounded-lg relative',
        borderColor,
        backgroundClass,
        isOverdue && 'animate-pulse ring-2 ring-destructive/50'
    )}>
      <CardContent className="p-3 sm:p-4 flex items-start gap-3">
        <div className="flex items-center pt-1">
          {accordionTrigger}
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={() => onToggle(task.id)}
            className={cn("mt-0")}
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
                <Badge className={cn('border cursor-pointer', color)}>
                    <Icon className="h-4 w-4 mr-1"/>
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
        <div className="flex items-center space-x-1">
            <TaskItemActions
                task={task}
                onUpdate={onUpdate}
                onAddSubTasks={onAddSubTasks}
                onDelete={onDelete}
                onAddToCalendar={onAddToCalendar}
            />
        </div>
      </CardContent>
    </Card>
  );
}

    