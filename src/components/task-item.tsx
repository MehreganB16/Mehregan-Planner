'use client';

import { format } from 'date-fns';
import { AlertTriangle, Calendar, ChevronDown, ChevronUp, Edit, Minus, Plus } from 'lucide-react';

import type { Task, Priority } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AddTaskDialog } from './add-task-dialog';
import { TaskItemActions } from './task-item-actions';
import { Progress } from './ui/progress';

interface TaskItemProps {
  task: Task;
  subtasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  onAddSubTasks: (parentId: string, subTasks: Omit<Task, 'id'| 'completed' | 'parentId'>[]) => void;
  isSubtask?: boolean;
}

const priorityConfig: Record<Priority, { label: string; color: string; icon: React.ElementType, borderColor: string }> = {
  urgent: { label: 'Urgent', color: 'bg-destructive text-destructive-foreground hover:bg-destructive/90', icon: AlertTriangle, borderColor: 'border-destructive' },
  high: { label: 'High', color: 'bg-accent text-accent-foreground hover:bg-accent/90', icon: ChevronUp, borderColor: 'border-accent' },
  medium: { label: 'Medium', color: 'bg-primary text-primary-foreground hover:bg-primary/90', icon: Minus, borderColor: 'border-primary' },
  low: { label: 'Low', color: 'bg-secondary text-secondary-foreground hover:bg-secondary/90', icon: ChevronDown, borderColor: 'border-secondary' },
};

export function TaskItem({ task, subtasks, onToggle, onDelete, onUpdate, onAddTask, onAddSubTasks, isSubtask = false }: TaskItemProps) {
  const { label, color, icon: Icon, borderColor } = priorityConfig[task.priority];
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  return (
    <Card className={cn(
      'transition-all hover:shadow-md border-l-4',
      task.completed && 'bg-muted/50',
      borderColor
    )}>
      <CardContent className="p-4 flex items-start gap-4">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="mt-1"
          aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
        />
        <div className="grid gap-1.5 flex-1">
          <label
            htmlFor={`task-${task.id}`}
            className={cn(
              'font-semibold cursor-pointer',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </label>
          {task.description && (
            <p className={cn('text-sm text-muted-foreground', task.completed && 'line-through')}>
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
              <div className={cn('flex items-center gap-1', isOverdue && 'text-destructive font-semibold')}>
                <Calendar className="h-4 w-4" />
                <span>{format(task.dueDate, 'MMM d, yyyy')}</span>
              </div>
            )}
            <Badge className={cn('border-transparent', color)}>
                <Icon className="h-4 w-4 mr-1"/>
                {label}
            </Badge>
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
            {!isSubtask && (
                <TaskItemActions task={task} onDelete={onDelete} onAddSubTasks={onAddSubTasks} />
            )}
        </div>
      </CardContent>
    </Card>
  );
}
