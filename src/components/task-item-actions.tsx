'use client';

import { useState } from 'react';
import { Bot, Loader2, MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { breakdownTask } from '@/ai/flows/breakdown-task-flow';
import type { Task } from '@/lib/types';
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

interface TaskItemActionsProps {
  task: Task;
  onDelete: (id: string) => void;
  onAddSubTasks: (parentId: string, subTasks: Omit<Task, 'id' | 'completed' | 'parentId' | 'createdAt'>[]) => void;
}

export function TaskItemActions({ task, onDelete, onAddSubTasks }: TaskItemActionsProps) {
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleBreakdown = async () => {
    setIsBreakingDown(true);
    try {
      const result = await breakdownTask({ taskTitle: task.title, taskDescription: task.description });
      if (result && result.subTasks) {
        const newSubTasks = result.subTasks.map(st => ({
            title: st.title,
            description: st.description,
            priority: task.priority,
            dueDate: task.dueDate
        }));
        onAddSubTasks(task.id, newSubTasks);
        toast({
          title: 'Task Broken Down!',
          description: `AI has added ${newSubTasks.length} sub-tasks to "${task.title}".`,
        });
      }
    } catch (error) {
      console.error('Failed to break down task:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem breaking down the task. Please try again.',
      });
    } finally {
      setIsBreakingDown(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <AlertDialog>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleBreakdown} disabled={isBreakingDown}>
            {isBreakingDown ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bot className="mr-2 h-4 w-4" />
            )}
            <span>Break down with AI</span>
          </DropdownMenuItem>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
                className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
                onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Task</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
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
            onClick={() => {
                setIsMenuOpen(false);
                onDelete(task.id);
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
