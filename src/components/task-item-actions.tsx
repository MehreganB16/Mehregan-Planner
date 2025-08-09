import { MoreVertical, Plus, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { Task } from '@/lib/types';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface TaskItemActionsProps {
  task: Task;
  onAddSubTasks: (parentId: string, subTasks: Omit<Task, 'id' | 'completed' | 'parentId' | 'createdAt'>[]) => void;
  onDelete: (id: string) => void;
}

export function TaskItemActions({ task, onAddSubTasks, onDelete }: TaskItemActionsProps) {

  const handleAddSubtask = (data: Omit<Task, 'id'|'completed'|'createdAt'>) => {
    onAddSubTasks(task.id, [data]);
  }

  return (
    <AlertDialog>
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>More Actions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
           <AddTaskDialog parentId={task.id} onTaskSave={handleAddSubtask} onTaskUpdate={()=>{}}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Add Sub-task</span>
            </DropdownMenuItem>
          </AddTaskDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
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
  );
}
