
'use client';

import { format, isPast, parse, setHours, setMinutes, differenceInHours } from 'date-fns';
import { AlertTriangle, Calendar, Check, ChevronDown, ChevronUp, Edit, Minus, Trash2, X, CalendarPlus, Plus } from 'lucide-react';
import * as React from 'react';

import type { Task, Priority } from '@/lib/types';
import { cn, isPersian } from '@/lib/utils';
import { AddTaskDialog } from './add-task-dialog';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DialogTrigger } from './ui/dialog';


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

  const handleAddSubtask = (data: Omit<Task, 'id'|'completed'|'createdAt'>) => {
    onAddSubTasks(task.id, [data]);
  }

  const dueDateHasTime = task.dueDate && (new Date(task.dueDate).getHours() !== 0 || new Date(task.dueDate).getMinutes() !== 0);
  
  return (
    <Card className={cn(
      'transition-all hover:shadow-md border-l-4 w-full rounded-lg relative',
      isOverdue ? 'border-destructive' : borderColor,
      isOverdue ? 'bg-destructive/10 dark:bg-destructive/20 animate-pulse-fast' : 'bg-card'
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
            {isOverdue && (
                <div className="flex items-center gap-1 text-destructive font-semibold">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Overdue</span>
                </div>
            )}
            {task.dueDate && (
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" type="button" className={cn(
                            "flex items-center gap-1 -mx-2 -my-1 h-auto px-2 py-1 text-sm",
                            isOverdue && "text-destructive font-semibold hover:text-destructive"
                        )}>
                            <Calendar className="h-4 w-4" />
                            <span>Due: {format(new Date(task.dueDate), dueDateHasTime ? 'MMM d, yyyy p' : 'MMM d, yyyy')}</span>
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
            <TooltipProvider>
              <AddTaskDialog isEditing={true} task={task} onTaskUpdate={onUpdate} onTaskSave={() => {}}>
                <DialogTrigger asChild>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" aria-label="Edit task">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit Task</p>
                        </TooltipContent>
                    </Tooltip>
                </DialogTrigger>
              </AddTaskDialog>

              <AddTaskDialog parentId={task.id} onTaskSave={handleAddSubtask} isEditing={false}>
                 <DialogTrigger asChild>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" aria-label="Add sub-task">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Add Sub-task</p>
                        </TooltipContent>
                    </Tooltip>
                </DialogTrigger>
              </AddTaskDialog>

              <AlertDialog>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive" aria-label="Delete task">
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>Delete Task</p>
                      </TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the task
                          and any associated sub-tasks.
                      </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={(e) => {
                              e.stopPropagation();
                              onDelete(task.id)
                          }}
                      >
                          Continue
                      </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
              {task.dueDate && (
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => onAddToCalendar(task)}>
                              <CalendarPlus className="h-4 w-4" />
                          </Button>
                      </TooltipTrigger>
                       <TooltipContent>
                          <p>Add to Calendar</p>
                      </TooltipContent>
                  </Tooltip>
              )}
            </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

    