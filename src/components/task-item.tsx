
'use client';

import { format, isPast, parse, setHours, setMinutes, differenceInDays } from 'date-fns';
import { AlertTriangle, Calendar, Check, ChevronDown, ChevronUp, Minus, X, WandSparkles, CircleDot, XCircle, Ban } from 'lucide-react';
import * as React from 'react';

import type { Task, Priority, TaskStatus } from '@/lib/types';
import { cn, isPersian } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Card, CardContent } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Progress } from './ui/progress';
import { TaskItemActions } from './task-item-actions';
import { useIsMobile } from '@/hooks/use-mobile';
import { CancelTaskDialog } from './cancel-task-dialog';


interface TaskItemProps {
  task: Task;
  subtasks: Task[];
  onSetStatus: (taskId: string, status: TaskStatus, cancellationNote?: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (task: Task) => void;
  onAddSubTasks: (parentId: string, subTasks: Omit<Task, 'id'| 'status' | 'parentId' | 'createdAt'>[]) => void;
  onAddToCalendar: (task: Task) => void;
  accordionTrigger?: React.ReactNode;
}

const priorityConfig: Record<Priority, { label: string; color: string; icon: React.ElementType, borderColor: string; checkboxColor: string; value: number }> = {
    urgent: { label: 'Urgent', color: 'border-transparent bg-red-500 text-red-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-red-50 dark:hover:bg-red-900/80', icon: AlertTriangle, borderColor: 'border-red-500/50 dark:border-red-900/80', checkboxColor: 'border-red-600', value: 4 },
    high: { label: 'High', color: 'border-transparent bg-orange-500 text-orange-50 hover:bg-orange-500/80 dark:bg-orange-800 dark:text-orange-50 dark:hover:bg-orange-800/80', icon: ChevronUp, borderColor: 'border-orange-500/50 dark:border-orange-800/80', checkboxColor: 'border-orange-500', value: 3 },
    medium: { label: 'Medium', color: 'border-transparent bg-blue-500 text-blue-50 hover:bg-blue-500/80 dark:bg-blue-800 dark:text-blue-50 dark:hover:bg-blue-800/80', icon: Minus, borderColor: 'border-blue-500/50 dark:border-blue-800/80', checkboxColor: 'border-blue-500', value: 2 },
    low: { label: 'Low', color: 'border-transparent bg-green-600 text-green-50 hover:bg-green-600/80 dark:bg-green-800 dark:text-green-50 dark:hover:bg-green-800/80', icon: ChevronDown, borderColor: 'border-green-500/50 dark:border-green-800/80', checkboxColor: 'border-green-400', value: 1 },
};

const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

const statusConfig: Record<TaskStatus, { icon: React.ElementType, color: string, label: string }> = {
    active: { icon: CircleDot, color: 'text-blue-500', label: 'Active' },
    completed: { icon: Check, color: 'text-green-500', label: 'Completed' },
    canceled: { icon: Ban, color: 'text-muted-foreground', label: 'Canceled' },
};

// Function to calculate dynamic pulse speed
const getPulseDuration = (task: Task): number => {
    if (!task.dueDate || task.status !== 'active' || !isPast(task.dueDate)) {
        return 2; // Default duration if not overdue
    }

    const priorityValue = priorityConfig[task.priority].value; // 1-4
    const daysOverdue = differenceInDays(new Date(), task.dueDate);

    // Increase urgency for tasks that are more overdue
    const overdueFactor = Math.max(1, 4 - Math.floor(daysOverdue / 3)); // Decreases every 3 days

    // Base duration of 2s, gets faster with higher priority and more days overdue
    // The formula is designed to produce values roughly between 0.5s (most urgent) and 2s (least urgent)
    const duration = 2.5 - (priorityValue * 0.3) - ((4 - overdueFactor) * 0.2);
    
    return Math.max(0.5, Math.min(2, duration)); // Clamp between 0.5s and 2s
};


export function TaskItem({ task, subtasks, onSetStatus, onDelete, onUpdate, onAddSubTasks, onAddToCalendar, accordionTrigger }: TaskItemProps) {
  const isOverdue = task.dueDate && task.status === 'active' && isPast(new Date(task.dueDate));
  const { label, color, icon: Icon, borderColor } = priorityConfig[task.priority];
  const [time, setTime] = React.useState(task.dueDate ? format(new Date(task.dueDate), "HH:mm") : "");
  const [isCancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const isMobile = useIsMobile();


  const completedSubtasks = subtasks.filter(st => st.status === 'completed').length;
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

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (newStatus === 'canceled' && task.status !== 'canceled') {
        setCancelDialogOpen(true);
    } else {
        onSetStatus(task.id, newStatus);
    }
  }

  const handleCancelTask = (note: string) => {
      onSetStatus(task.id, 'canceled', note);
      setCancelDialogOpen(false);
  }
  
  const backgroundClass = isOverdue
    ? 'bg-destructive/10 dark:bg-destructive/20'
    : task.status === 'completed'
    ? 'bg-muted/50'
    : task.status === 'canceled'
    ? 'bg-neutral-200/50 dark:bg-neutral-800/20'
    : 'bg-card';

  const pulseDuration = getPulseDuration(task);

  const CurrentStatusIcon = statusConfig[task.status].icon;

  return (
    <Card 
        className={cn(
            'transition-all hover:shadow-lg w-full rounded-lg relative group',
            'border-l-4',
            task.status === 'canceled' ? 'border-neutral-400' : borderColor,
            backgroundClass,
            isOverdue && 'animate-pulse group-hover:animation-paused'
        )}
        style={{ animationDuration: isOverdue ? `${pulseDuration}s` : undefined }}
    >
      <CardContent className="p-3 sm:p-4 flex items-start gap-3">
        <div className="flex items-center pt-1">
          {accordionTrigger}
           <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                         <CurrentStatusIcon className={cn("h-5 w-5", statusConfig[task.status].color)} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleStatusChange('active')} disabled={task.status === 'active'}>
                        <CircleDot className="mr-2 h-4 w-4"/>
                        <span>Set Active</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('completed')} disabled={task.status === 'completed'}>
                        <Check className="mr-2 h-4 w-4"/>
                        <span>Set Completed</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleStatusChange('canceled')} disabled={task.status === 'canceled'}>
                        <XCircle className="mr-2 h-4 w-4"/>
                        <span>Cancel Task</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="grid gap-1.5 flex-1">
          <span
            className={cn(
              'font-semibold',
              task.status === 'completed' && 'line-through text-muted-foreground',
              task.status === 'canceled' && 'line-through text-muted-foreground',
              hasPersian && 'font-persian'
            )}
          >
            {task.title}
          </span>
          {task.description && (
            <p className={cn('text-sm text-muted-foreground', (task.status === 'completed' || task.status === 'canceled') && 'line-through', hasPersian && 'font-persian')}>
              {task.description}
            </p>
          )}
          {task.status === 'canceled' && task.cancellationNote && (
            <p className="text-xs text-muted-foreground italic mt-1 p-2 bg-neutral-200/50 dark:bg-neutral-900/40 rounded-md">
                <span className="font-semibold">Cancellation Note:</span> {task.cancellationNote}
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
                             isOverdue && task.status === 'active' && "text-destructive font-semibold hover:text-destructive"
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
             {task.completionDate && task.status === 'completed' && (
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
        <div className={cn(
            "flex items-center self-start space-x-1 transition-opacity",
            isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
            <TaskItemActions
                task={task}
                onUpdate={onUpdate}
                onAddSubTasks={onAddSubTasks}
                onDelete={onDelete}
                onAddToCalendar={onAddToCalendar}
                onSetStatus={onSetStatus}
            />
        </div>
        <CancelTaskDialog 
            open={isCancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            onCancelTask={handleCancelTask}
            taskTitle={task.title}
        />
      </CardContent>
    </Card>
  );
}

    

    
