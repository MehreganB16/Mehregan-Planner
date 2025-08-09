
'use client';

import { format } from 'date-fns';
import { AlertTriangle, Calendar, Check, ChevronDown, ChevronUp, Edit, Minus, Trash2, X, CalendarPlus } from 'lucide-react';

import type { Task, Priority } from '@/lib/types';
import { cn, isPersian } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AddTaskDialog } from './add-task-dialog';
import { TaskItemActions } from './task-item-actions';
import { Progress } from './ui/progress';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from './ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ics } from 'ics';


interface TaskItemProps {
  task: Task;
  subtasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (task: Task) => void;
  onAddSubTasks: (parentId: string, subTasks: Omit<Task, 'id'| 'completed' | 'parentId' | 'createdAt'>[]) => void;
  accordionTrigger?: React.ReactNode;
}

const priorityConfig: Record<Priority, { label: string; color: string; icon: React.ElementType, borderColor: string; checkboxColor: string }> = {
    urgent: { label: 'Urgent', color: 'bg-red-600 text-white hover:bg-red-600/90', icon: AlertTriangle, borderColor: 'border-red-600', checkboxColor: 'border-red-600' },
    high: { label: 'High', color: 'bg-accent text-accent-foreground hover:bg-accent/90', icon: ChevronUp, borderColor: 'border-accent', checkboxColor: 'border-accent' },
    medium: { label: 'Medium', color: 'bg-primary text-primary-foreground hover:bg-primary/90', icon: Minus, borderColor: 'border-primary', checkboxColor: 'border-primary' },
    low: { label: 'Low', color: 'bg-green-100/50 text-green-800 border-green-200/50 hover:bg-green-100/80 dark:bg-green-400/50 dark:text-green-950 dark:border-green-800/50 dark:hover:bg-green-400/90', icon: ChevronDown, borderColor: 'border-green-200/50 dark:border-green-800/50', checkboxColor: 'border-green-400/50 dark:border-green-700/50' },
};

const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

export function TaskItem({ task, subtasks, onToggle, onDelete, onUpdate, onAddSubTasks, accordionTrigger }: TaskItemProps) {
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
  const { label, color, icon: Icon, borderColor, checkboxColor } = priorityConfig[task.priority];
  const { toast } = useToast();

  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  const hasPersian = isPersian(task.title) || (task.description && isPersian(task.description));

  const handlePriorityChange = (newPriority: string) => {
    if (priorities.includes(newPriority as Priority)) {
        onUpdate({ ...task, priority: newPriority as Priority });
    }
  }

  const handleAddToCalendar = () => {
    if (!task.dueDate) return;

    const event = {
        title: task.title,
        description: task.description,
        start: [task.dueDate.getUTCFullYear(), task.dueDate.getUTCMonth() + 1, task.dueDate.getUTCDate(), task.dueDate.getUTCHours(), task.dueDate.getUTCMinutes()],
        duration: { hours: 1 },
    };

    ics.createEvent(event, (error, value) => {
        if (error) {
            console.error(error);
            toast({
                title: "Error creating calendar event",
                variant: "destructive",
            });
            return;
        }

        const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${task.title.replace(/\s+/g, '_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
  }

  return (
    <Card className={cn(
      'transition-all hover:shadow-md border-l-4 w-full rounded-lg relative',
      borderColor,
      isOverdue && !task.completed ? 'animate-outline-pulse' : '',
      task.completed && 'bg-muted/50'
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
            {task.dueDate && !task.completed && (
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" type="button" className={cn(
                            "flex items-center gap-1 -mx-2 -my-1 h-auto px-2 py-1 text-sm",
                            isOverdue && "text-destructive font-semibold hover:text-destructive"
                        )}>
                            <Calendar className="h-4 w-4" />
                            <span>Due: {format(task.dueDate, 'MMM d, yyyy')}</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                            mode="single"
                            selected={task.dueDate}
                            onSelect={(date) => onUpdate({ ...task, dueDate: date || undefined })}
                            initialFocus
                        />
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
                    <span>Completed: {format(task.completionDate, 'MMM d, yyyy')}</span>
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
        <div className="flex items-center flex-wrap-reverse sm:flex-nowrap justify-end -mr-2">
             <TaskItemActions task={task} onAddSubTasks={onAddSubTasks} onDelete={onDelete} />
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <AddTaskDialog task={task} onTaskUpdate={onUpdate} onTaskSave={() => {}}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" aria-label="Edit task">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </AddTaskDialog>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Edit Task</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {task.dueDate && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleAddToCalendar}>
                                <CalendarPlus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Add to Calendar</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
