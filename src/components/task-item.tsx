
'use client';

import { format } from 'date-fns';
import { AlertTriangle, Calendar, Check, ChevronDown, ChevronUp, Edit, Minus, Plus, Trash2 } from 'lucide-react';

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

interface TaskItemProps {
  task: Task;
  subtasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  onAddSubTasks: (parentId: string, subTasks: Omit<Task, 'id'| 'completed' | 'parentId' | 'createdAt'>[]) => void;
  isSubtask?: boolean;
}

const priorityConfig: Record<Priority, { label: string; color: string; icon: React.ElementType, borderColor: string; checkboxColor: string }> = {
    urgent: { label: 'Urgent', color: 'bg-red-600 text-white hover:bg-red-600/90', icon: AlertTriangle, borderColor: 'border-red-600', checkboxColor: 'border-red-600' },
    high: { label: 'High', color: 'bg-accent text-accent-foreground hover:bg-accent/90', icon: ChevronUp, borderColor: 'border-accent', checkboxColor: 'border-accent' },
    medium: { label: 'Medium', color: 'bg-primary text-primary-foreground hover:bg-primary/90', icon: Minus, borderColor: 'border-primary', checkboxColor: 'border-primary' },
    low: { label: 'Low', color: 'bg-green-100/50 text-green-800 border-green-200/50 hover:bg-green-100/80 dark:bg-green-400/50 dark:text-green-950 dark:border-green-800/50 dark:hover:bg-green-400/90', icon: ChevronDown, borderColor: 'border-green-200/50 dark:border-green-800/50', checkboxColor: 'border-green-400/50 dark:border-green-700/50' },
};

const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

export function TaskItem({ task, subtasks, onToggle, onDelete, onUpdate, onAddTask, onAddSubTasks, isSubtask = false }: TaskItemProps) {
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
  const { label, color, icon: Icon, borderColor, checkboxColor } = priorityConfig[task.priority];
  

  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  const hasPersian = isPersian(task.title) || (task.description && isPersian(task.description));

  const handlePriorityChange = (newPriority: string) => {
    if (priorities.includes(newPriority as Priority)) {
        onUpdate({ ...task, priority: newPriority as Priority });
    }
  }

  return (
    <Card className={cn(
      'transition-all hover:shadow-md border-l-4 w-full',
      borderColor,
      task.completed && 'bg-muted/50',
      isOverdue && 'animate-pulse-destructive'
    )}>
      <CardContent className="p-4 flex items-start gap-4">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className={cn("mt-1", checkboxColor)}
          aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
        />
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
              <div className={cn('flex items-center gap-1', isOverdue && 'text-destructive font-semibold')}>
                <Calendar className="h-4 w-4" />
                <span>Due: {format(task.dueDate, 'MMM d, yyyy')}</span>
              </div>
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
        <div className="flex items-center">
            {!isSubtask && (
              <AddTaskDialog onTaskSave={onAddTask} parentId={task.id}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" aria-label="Add sub-task">
                      <Plus className="h-4 w-4" />
                  </Button>
              </AddTaskDialog>
            )}
            <AddTaskDialog task={task} onTaskUpdate={onUpdate} onTaskSave={() => {}}>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" aria-label="Edit task">
                    <Edit className="h-4 w-4" />
                </Button>
            </AddTaskDialog>
            {isSubtask ? (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive-foreground hover:bg-destructive" aria-label="Delete sub-task">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this sub-task.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => onDelete(task.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ) : (
                <TaskItemActions task={task} onDelete={onDelete} onAddSubTasks={onAddSubTasks} />
            )}
        </div>
      </CardContent>
    </Card>
  );
}
